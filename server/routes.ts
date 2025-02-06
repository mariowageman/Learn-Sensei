import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateExplanation, generateQuestion, checkAnswer } from "./openai";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { sessions, messages, quizQuestions } from "@db/schema";

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

    const result = await checkAnswer(question.text, question.answer, answer);

    // Log the response for debugging
    console.log("OpenAI response:", JSON.stringify(result, null, 2));

    // Additional validation for video suggestions
    if (!result.correct && Array.isArray(result.videoSuggestions)) {
      result.videoSuggestions = result.videoSuggestions
        .filter((v: any) => v && typeof v.videoId === 'string' && v.videoId.length === 11)
        .slice(0, 3); // Ensure we only return up to 3 videos
    }

    res.json({
      correct: result.correct,
      feedback: result.feedback,
      videoSuggestions: result.videoSuggestions
    });
  });

  return httpServer;
}