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
  learningPathProgress,
  progressAnalytics // Assuming this schema exists for analytics
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

      // Calculate total stats
      const total = progress.length;
      const correct = progress.filter(p => p.isCorrect).length;
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

      // Calculate time spent and streak
      const learningPath = await db.query.learningPaths.findFirst({
        where: eq(learningPaths.title, subject),
        with: {
          progress: {
            orderBy: (progress, { desc }) => [desc(progress.updatedAt)]
          }
        }
      });

      let timeSpentMinutes = 0;
      let streakDays = 0;
      let lastStreakDate = null;

      if (learningPath?.progress?.[0]) {
        const pathProgress = learningPath.progress[0];
        // Sum up time spent across all topics
        timeSpentMinutes = Object.values(pathProgress.timeSpentMinutes as Record<string, number>)
          .reduce((sum, time) => sum + time, 0);
        streakDays = pathProgress.streakDays;
        lastStreakDate = pathProgress.lastStreakDate;
      }

      // Calculate weekly progress
      const weeklyProgress = await db.query.progressAnalytics.findMany({
        where: and(
          eq(progressAnalytics.pathId, learningPath?.id ?? 0),
          sql`date >= NOW() - INTERVAL '7 days'`
        ),
        orderBy: (analytics, { asc }) => [asc(analytics.date)]
      });

      // Calculate average accuracy
      const avgAccuracy = weeklyProgress.length > 0
        ? Math.round(
            weeklyProgress.reduce((sum, day) =>
              sum + (day.correctAnswers / day.totalAttempts) * 100, 0
            ) / weeklyProgress.length
          )
        : 0;

      res.json({
        total,
        correct,
        percentage,
        timeSpentMinutes,
        streakDays,
        avgAccuracy,
        weeklyProgress: weeklyProgress.map(day => ({
          date: day.date,
          correct: day.correctAnswers,
          total: day.totalAttempts
        })),
        recentAttempts: progress.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // Learning Paths routes
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const paths = await db.query.learningPaths.findMany({
        orderBy: (paths, { asc }) => [asc(paths.difficulty), asc(paths.title)],
        with: {
          progress: {
            orderBy: (progress, { desc }) => [desc(progress.updatedAt)]
          }
        }
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
        completedTopics: sql`'[]'::jsonb`,
        updatedAt: new Date(),
        timeSpentMinutes: sql`'{}'::jsonb`, // Initialize timeSpentMinutes as an empty JSONB object
        streakDays: 1,
        lastStreakDate: new Date()
      }).returning();

      res.json(progress);
    } catch (error) {
      console.error('Error creating learning path progress:', error);
      res.status(500).json({ error: "Failed to create progress" });
    }
  });

  app.patch("/api/learning-paths/:id/progress", async (req, res) => {
    const { id } = req.params;
    const { completedTopic, timeSpentMinutes } = req.body;

    try {
      // Get current progress
      const currentProgress = await db.query.learningPathProgress.findFirst({
        where: eq(learningPathProgress.pathId, parseInt(id)),
        orderBy: (progress, { desc }) => [desc(progress.updatedAt)]
      });

      if (!currentProgress) {
        return res.status(404).json({ error: "No progress found" });
      }

      const path = await db.query.learningPaths.findFirst({
        where: eq(learningPaths.id, parseInt(id))
      });

      if (!path) {
        return res.status(404).json({ error: "Learning path not found" });
      }

      // Update streak
      const lastStreakDate = new Date(currentProgress.lastStreakDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24));

      let newStreakDays = currentProgress.streakDays;
      if (daysDiff === 0) {
        // Same day, streak continues
        newStreakDays = currentProgress.streakDays;
      } else if (daysDiff === 1) {
        // Next day, increment streak
        newStreakDays = currentProgress.streakDays + 1;
      } else {
        // Streak broken
        newStreakDays = 1;
      }

      // Update progress
      const [progress] = await db
        .update(learningPathProgress)
        .set({
          completedTopics: sql`CASE 
            WHEN completed_topics IS NULL OR completed_topics = '[]'::jsonb 
            THEN jsonb_build_array(${completedTopic}::int)
            ELSE completed_topics || jsonb_build_array(${completedTopic}::int)
          END`,
          completed: sql`CASE 
            WHEN jsonb_array_length(
              CASE 
                WHEN completed_topics IS NULL OR completed_topics = '[]'::jsonb
                THEN jsonb_build_array(${completedTopic}::int)
                ELSE completed_topics || jsonb_build_array(${completedTopic}::int)
              END
            ) >= ${path.topics.length}
            THEN true 
            ELSE false 
          END`,
          currentTopic: sql`CASE 
            WHEN ${completedTopic} + 1 >= ${path.topics.length}
            THEN ${completedTopic}
            ELSE ${completedTopic} + 1
          END`,
          timeSpentMinutes: sql`
            CASE
              WHEN time_spent_minutes IS NULL OR time_spent_minutes = '{}'::jsonb
              THEN jsonb_build_object(${completedTopic}::text, ${timeSpentMinutes}::int)
              ELSE time_spent_minutes || 
                   jsonb_build_object(${completedTopic}::text, 
                     COALESCE((time_spent_minutes->>${completedTopic}::text)::int, 0) + ${timeSpentMinutes}::int
                   )
            END
          `,
          streakDays: newStreakDays,
          lastStreakDate: today,
          updatedAt: new Date()
        })
        .where(eq(learningPathProgress.id, currentProgress.id))
        .returning();

      // Update analytics
      await db.insert(progressAnalytics).values({
        pathId: parseInt(id),
        date: today,
        topicsCompleted: progress.completedTopics.length,
        timeSpentMinutes,
        correctAnswers: 1, // Assuming completion means correct
        totalAttempts: 1,
      });

      res.json(progress);
    } catch (error) {
      console.error('Error updating learning path progress:', error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  return httpServer;
}