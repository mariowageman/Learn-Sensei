import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateExplanation, generateQuestion, checkAnswer } from "./openai";
import { db } from "@db";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  sessions, 
  messages, 
  quizQuestions, 
  quizProgress,
  learningPaths,
  learningPathProgress
} from "@db/schema";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  app.get("/api/session", async (req, res) => {
    const session = await db.query.sessions.findFirst({
      orderBy: (sessions, { desc }) => [desc(sessions.createdAt)]
    });
    res.json(session);
  });

  app.get("/api/messages/:subject", async (req, res) => {
    const { subject } = req.params;
    const sessionMessages = await db.query.messages.findMany({
      where: eq(messages.subject, subject),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)]
    });
    res.json(sessionMessages);
  });

  app.post("/api/messages", async (req, res) => {
    const { subject, message } = req.body;
    const response = await generateExplanation(subject);

    await db.insert(messages).values([
      { role: "user", content: message, subject },
      { role: "assistant", content: response.explanation, subject }
    ]);

    res.json({ success: true });
  });

  app.get("/api/quiz/:subject", async (req, res) => {
    const { subject } = req.params;
    const question = await generateQuestion(subject);

    const [savedQuestion] = await db.insert(quizQuestions).values({
      text: question.question,
      answer: question.answer,
      subject
    }).returning();

    res.json(savedQuestion);
  });

  app.post("/api/quiz/check", async (req, res) => {
    const { questionId, answer } = req.body;

    const question = await db.query.quizQuestions.findFirst({
      where: eq(quizQuestions.id, questionId)
    });
    if (!question) return res.status(404).json({ error: "Question not found" });

    try {
      const result = await checkAnswer(question.text, question.answer, answer);

      await db.insert(quizProgress).values({
        questionId,
        subject: question.subject,
        isCorrect: result.correct,
        userAnswer: answer
      });

      res.json({
        correct: result.correct,
        feedback: result.feedback,
        videoSuggestions: result.videoSuggestions || []
      });
    } catch (error) {
      console.error('Error checking answer:', error);
      res.status(500).json({ 
        error: "Failed to check answer",
        correct: false,
        feedback: "Sorry, there was an error checking your answer. Please try again.",
        videoSuggestions: []
      });
    }
  });

  app.get("/api/progress/:subject", async (req, res) => {
    const { subject } = req.params;
    try {
      const progress = await db.query.quizProgress.findMany({
        where: eq(quizProgress.subject, subject),
        orderBy: (quizProgress, { desc }) => [desc(quizProgress.createdAt)]
      });

      const total = progress.length;
      const correct = progress.filter(p => p.isCorrect).length;
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

      res.json({
        total,
        correct,
        percentage,
        recentAttempts: progress.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // New Learning Paths routes
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const paths = await db.query.learningPaths.findMany({
        orderBy: (paths, { asc }) => [asc(paths.difficulty), asc(paths.title)]
      });
      res.json(paths);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      res.status(500).json({ error: "Failed to fetch learning paths" });
    }
  });

  app.get("/api/learning-paths/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const path = await db.query.learningPaths.findFirst({
        where: eq(learningPaths.id, parseInt(id)),
        with: {
          progress: {
            orderBy: (progress, { desc }) => [desc(progress.updatedAt)]
          }
        }
      });
      if (!path) {
        return res.status(404).json({ error: "Learning path not found" });
      }
      res.json(path);
    } catch (error) {
      console.error('Error fetching learning path:', error);
      res.status(500).json({ error: "Failed to fetch learning path" });
    }
  });

  app.post("/api/learning-paths/:id/progress", async (req, res) => {
    const { id } = req.params;
    const { topicIndex } = req.body;

    try {
      const [progress] = await db.insert(learningPathProgress).values({
        pathId: parseInt(id),
        currentTopic: topicIndex,
        completed: false,
        completedTopics: sql`'[]'::jsonb` 
      }).returning();

      res.json(progress);
    } catch (error) {
      console.error('Error creating learning path progress:', error);
      res.status(500).json({ error: "Failed to create progress" });
    }
  });

  app.patch("/api/learning-paths/:id/progress", async (req, res) => {
    const { id } = req.params;
    const { completedTopic } = req.body;

    try {
      const path = await db.query.learningPaths.findFirst({
        where: eq(learningPaths.id, parseInt(id))
      });

      if (!path) {
        return res.status(404).json({ error: "Learning path not found" });
      }

      const [progress] = await db
        .update(learningPathProgress)
        .set({
          completedTopics: sql`completed_topics || ${sql.raw(`'[${completedTopic}]'::jsonb`)}`,
          completed: sql`(SELECT CASE 
            WHEN jsonb_array_length(${path.topics}::jsonb) <= (jsonb_array_length(completed_topics) + 1) 
            THEN true 
            ELSE false 
          END)`,
          updatedAt: new Date()
        })
        .where(eq(learningPathProgress.pathId, parseInt(id)))
        .returning();

      res.json(progress);
    } catch (error) {
      console.error('Error updating learning path progress:', error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  return httpServer;
}