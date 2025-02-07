import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateExplanation, generateQuestion, checkAnswer } from "./openai";
import { db } from "@db";
import { eq, and, desc, sql, gt, lt } from "drizzle-orm";
import {
  sessions,
  messages,
  quizQuestions,
  quizProgress,
  learningPaths,
  learningPathProgress,
  progressAnalytics,
  subjectHistory
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
    const { questionId, answer, timeSpent } = req.body;

    const question = await db.query.quizQuestions.findFirst({
      where: eq(quizQuestions.id, questionId)
    });
    if (!question) return res.status(404).json({ error: "Question not found" });

    try {
      const result = await checkAnswer(question.text, question.answer, answer);

      // Get or create learning path progress
      let learningPath = await db.query.learningPaths.findFirst({
        where: eq(learningPaths.title, question.subject),
        with: {
          progress: {
            orderBy: (progress, { desc }) => [desc(progress.updatedAt)]
          }
        }
      });

      if (!learningPath) {
        const [newPath] = await db.insert(learningPaths).values({
          title: question.subject,
          description: `Learn about ${question.subject}`,
          difficulty: "beginner",
          topics: [],
          prerequisites: [],
          estimatedHours: 1
        }).returning();
        learningPath = newPath;
      }

      let pathProgress = learningPath.progress?.[0];

      if (!pathProgress) {
        const [newProgress] = await db.insert(learningPathProgress).values({
          pathId: learningPath.id,
          currentTopic: 0,
          completed: false,
          completedTopics: [],
          timeSpentMinutes: { quiz: 0 },
          streakDays: 1,
          lastStreakDate: new Date()
        }).returning();
        pathProgress = newProgress;
      } else {
        // Update existing progress
        const lastStreakDate = new Date(pathProgress.lastStreakDate);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24));

        let newStreakDays = pathProgress.streakDays;
        if (daysDiff === 0) {
          newStreakDays = pathProgress.streakDays;
        } else if (daysDiff === 1) {
          newStreakDays = pathProgress.streakDays + 1;
        } else {
          newStreakDays = 1;
        }

        // Update time spent with actual time
        const currentTimeSpent = (pathProgress.timeSpentMinutes || {}) as Record<string, number>;
        currentTimeSpent.quiz = (currentTimeSpent.quiz || 0) + (timeSpent || 0);

        await db.update(learningPathProgress)
          .set({
            timeSpentMinutes: currentTimeSpent,
            streakDays: newStreakDays,
            lastStreakDate: today,
            updatedAt: today
          })
          .where(eq(learningPathProgress.id, pathProgress.id));
      }

      // Save quiz progress
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

      if (learningPath?.progress?.[0]) {
        const pathProgress = learningPath.progress[0];
        // Sum up time spent across all topics
        const timeSpentObj = pathProgress.timeSpentMinutes as Record<string, number> || {};
        timeSpentMinutes = Object.values(timeSpentObj).reduce((sum, time) => sum + (time || 0), 0);
        streakDays = pathProgress.streakDays || 0;
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
              sum + ((day.correctAnswers / (day.totalAttempts || 1)) * 100), 0
            ) / weeklyProgress.length
          )
        : 0;

      res.json({
        total,
        correct,
        percentage,
        timeSpentMinutes: timeSpentMinutes || 0,
        streakDays: streakDays || 0,
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
      const completedTopics = currentProgress.completedTopics || [];
      const updatedCompletedTopics = Array.from(new Set([...completedTopics, completedTopic]));
      const isCompleted = updatedCompletedTopics.length >= (path.topics as string[]).length;
      const nextTopic = isCompleted ? completedTopic : completedTopic + 1;

      // Update time spent
      const currentTimeSpent = (currentProgress.timeSpentMinutes || {}) as Record<string, number>;
      const updatedTimeSpent = {
        ...currentTimeSpent,
        [completedTopic]: (currentTimeSpent[completedTopic] || 0) + (timeSpentMinutes || 0)
      };

      const [progress] = await db
        .update(learningPathProgress)
        .set({
          completedTopics: updatedCompletedTopics,
          completed: isCompleted,
          currentTopic: nextTopic,
          timeSpentMinutes: updatedTimeSpent,
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
        topicsCompleted: updatedCompletedTopics.length,
        timeSpentMinutes: timeSpentMinutes || 0,
        correctAnswers: 1, // Assuming completion means correct
        totalAttempts: 1,
      });

      res.json(progress);
    } catch (error) {
      console.error('Error updating learning path progress:', error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  app.get("/api/recommendations", async (req, res) => {
    try {
      // Get user's progress across all learning paths
      const progress = await db.query.learningPathProgress.findMany({
        orderBy: (progress, { desc }) => [desc(progress.updatedAt)]
      });

      // Get quiz performance data
      const quizPerformance = await db.query.quizProgress.findMany({
        orderBy: (quiz, { desc }) => [desc(quiz.createdAt)]
      });

      // Get all learning paths
      const allPaths = await db.query.learningPaths.findMany({
        orderBy: (paths, { asc }) => [asc(paths.difficulty)]
      });

      // Calculate recommendations based on:
      // 1. Current skill level (from quiz performance)
      // 2. Learning pace (from time spent)
      // 3. Topic progression (from completed topics)
      const recommendations = allPaths
        .filter(path => {
          // Filter out paths that user has already completed
          const pathProgress = progress.find(p => p.pathId === path.id);
          return !pathProgress?.completed;
        })
        .map(path => {
          const pathProgress = progress.find(p => p.pathId === path.id);
          const subjectQuizzes = quizPerformance.filter(q => q.subject === path.title);

          // Calculate confidence score based on various factors
          const quizAccuracy = subjectQuizzes.length > 0
            ? subjectQuizzes.filter(q => q.isCorrect).length / subjectQuizzes.length
            : 0;

          const timeSpent = pathProgress
            ? Object.values(pathProgress.timeSpentMinutes as Record<string, number>)
                .reduce((sum, time) => sum + time, 0)
            : 0;

          // Calculate a confidence score (0-1) for this recommendation
          const confidenceScore = calculateConfidenceScore(
            path,
            quizAccuracy,
            timeSpent,
            pathProgress
          );

          // Generate a personalized reason for the recommendation
          const reason = generateRecommendationReason(
            path,
            quizAccuracy,
            pathProgress
          );

          return {
            pathId: path.id,
            title: path.title,
            reason,
            difficulty: path.difficulty,
            confidenceScore,
            topics: path.topics as string[],
          };
        })
        .sort((a, b) => b.confidenceScore - a.confidenceScore)
        .slice(0, 4); // Return top 4 recommendations

      res.json(recommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  app.get("/api/recent-subjects", async (req, res) => {
    try {
      const recentSubjects = await db.query.subjectHistory.findMany({
        orderBy: (history, { desc }) => [desc(history.createdAt)],
        limit: 5
      });
      res.json(recentSubjects);
    } catch (error) {
      console.error('Error fetching recent subjects:', error);
      res.status(500).json({ error: "Failed to fetch recent subjects" });
    }
  });

  app.post("/api/session", async (req, res) => {
    const { subject } = req.body;

    try {
      // Save to session
      const [session] = await db.insert(sessions).values({
        subject
      }).returning();

      // Save to history
      await db.insert(subjectHistory).values({
        subject
      });

      res.json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });


  return httpServer;
}

function calculateConfidenceScore(
  path: typeof learningPaths.$inferSelect,
  quizAccuracy: number,
  timeSpent: number,
  progress?: typeof learningPathProgress.$inferSelect | null
): number {
  let score = 0;

  // Base score from quiz performance (40% weight)
  score += quizAccuracy * 0.4;

  // Engagement score from time spent (30% weight)
  const engagementScore = Math.min(timeSpent / (path.estimatedHours * 60), 1);
  score += engagementScore * 0.3;

  // Progress score (30% weight)
  if (progress) {
    const progressScore = (progress.completedTopics as number[]).length / (path.topics as string[]).length;
    score += progressScore * 0.3;
  } else {
    // If no progress, boost score for beginner-friendly paths
    score += (path.difficulty === 'beginner' ? 0.2 : 0.1);
  }

  return score;
}

function generateRecommendationReason(
  path: typeof learningPaths.$inferSelect,
  quizAccuracy: number,
  progress?: typeof learningPathProgress.$inferSelect | null
): string {
  if (!progress) {
    return `Start your journey with ${path.title} - perfect for building a strong foundation.`;
  }

  const completedTopics = (progress.completedTopics as number[]).length;
  const totalTopics = (path.topics as string[]).length;

  if (completedTopics > 0) {
    const progressPercent = Math.round((completedTopics / totalTopics) * 100);
    return `Continue your progress in ${path.title} - you're already ${progressPercent}% through!`;
  }

  if (quizAccuracy > 0.8) {
    return `Challenge yourself with ${path.title} - your quiz performance shows you're ready!`;
  }

  return `Enhance your skills with ${path.title} - aligned with your current learning progress.`;
}