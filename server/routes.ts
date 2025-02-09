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
import { fetchCourseraCourses, type CourseraCourse } from "./coursera";

// Initialize Coursera API configuration
const courseraConfig = {
  apiKey: process.env.COURSERA_API_KEY,
  apiSecret: process.env.COURSERA_API_SECRET
};

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
      const subject = req.query.subject as string | undefined;
      const recommended = req.query.recommended === 'true';

      if (recommended) {
        // Get user's recent subjects from history
        const recentSubjects = await db.query.subjectHistory.findMany({
          orderBy: (history, { desc }) => [desc(history.createdAt)],
          limit: 5
        });

        // If user has history, fetch courses based on their interests
        if (recentSubjects.length > 0) {
          console.log('Fetching recommended courses based on recent subjects:', recentSubjects.map(s => s.subject));

          // Fetch courses for each recent subject
          const allRecommendedCourses = await Promise.all(
            recentSubjects.map(async ({ subject }) => {
              const courses = await fetchCourseraCourses(subject);
              return courses.slice(0, 2); // Take top 2 courses from each subject
            })
          );

          // Flatten and transform courses
          const courses = allRecommendedCourses.flat();

          // Transform Coursera courses into our learning path format
          const paths = courses.map(course => ({
            id: parseInt(course.id),
            title: course.name,
            description: course.description,
            difficulty: course.specializations?.length ? "advanced" : "intermediate",
            topics: course.primaryLanguages || [],
            prerequisites: [],
            estimatedHours: parseInt(course.workload?.split(" ")[0] || "0"),
            instructor: course.instructors[0]?.fullName,
            partner: course.partners[0]?.name,
            photoUrl: course.photoUrl,
            externalLink: `https://www.coursera.org/learn/${course.slug}`
          }));

          return res.json(paths);
        }
      }

      // If not recommended or no history, proceed with normal subject filtering
      console.log('Fetching courses for subject:', subject);
      const courses = await fetchCourseraCourses(subject);

      // Transform Coursera courses into our learning path format
      const paths = courses.map(course => ({
        id: parseInt(course.id),
        title: course.name,
        description: course.description,
        difficulty: course.specializations?.length ? "advanced" : "intermediate",
        topics: course.primaryLanguages || [],
        prerequisites: [],
        estimatedHours: parseInt(course.workload?.split(" ")[0] || "0"),
        instructor: course.instructors[0]?.fullName,
        partner: course.partners[0]?.name,
        photoUrl: course.photoUrl,
        externalLink: `https://www.coursera.org/learn/${course.slug}`
      }));

      res.json(paths);
    } catch (error) {
      console.error('Error fetching Coursera courses:', error);
      res.status(500).json({ error: "Failed to fetch courses" });
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

      // Get subject history
      const subjectHistory = await db.query.subjectHistory.findMany({
        orderBy: (history, { desc }) => [desc(history.createdAt)]
      });

      // Get all learning paths
      const allPaths = await db.query.learningPaths.findMany({
        orderBy: (paths, { asc }) => [asc(paths.difficulty)]
      });

      // Calculate recommendations
      const recommendations = allPaths
        .filter(path => {
          const pathProgress = progress.find(p => p.pathId === path.id);
          return !pathProgress?.completed;
        })
        .map(path => {
          const pathProgress = progress.find(p => p.pathId === path.id);
          const subjectQuizzes = quizPerformance.filter(q => q.subject === path.title);

          const quizAccuracy = subjectQuizzes.length > 0
            ? subjectQuizzes.filter(q => q.isCorrect).length / subjectQuizzes.length
            : 0;

          const timeSpent = pathProgress
            ? Object.values(pathProgress.timeSpentMinutes as Record<string, number>)
              .reduce((sum, time) => sum + time, 0)
            : 0;

          const confidenceScore = calculateConfidenceScore(
            path,
            quizAccuracy,
            timeSpent,
            pathProgress,
            subjectHistory
          );

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

  app.get("/api/dashboard", async (req, res) => {
    try {
      // Get all quiz attempts
      const quizAttempts = await db.query.quizProgress.findMany({
        orderBy: (progress, { desc }) => [desc(progress.createdAt)]
      });

      // Get unique subjects
      const subjects = [...new Set(quizAttempts.map(attempt => attempt.subject))];

      // Calculate overall stats
      const totalSubjects = subjects.length;
      let totalCorrect = 0;
      let totalAttempts = 0;

      // Calculate subject-specific performance
      const subjectPerformance = subjects.map(subject => {
        const subjectAttempts = quizAttempts.filter(attempt => attempt.subject === subject);
        const correct = subjectAttempts.filter(attempt => attempt.isCorrect).length;
        const total = subjectAttempts.length;

        totalCorrect += correct;
        totalAttempts += total;

        return {
          subject,
          totalAttempts: total,
          correctAnswers: correct,
          accuracy: Math.round((correct / total) * 100)
        };
      });

      // Get the current learning streak
      const pathProgress = await db.query.learningPathProgress.findMany({
        orderBy: (progress, { desc }) => [desc(progress.updatedAt)]
      });

      const currentStreak = pathProgress[0]?.streakDays || 0;

      // Calculate total time spent
      const totalTimeSpent = pathProgress.reduce((total, progress) => {
        const timeSpent = progress.timeSpentMinutes as Record<string, number>;
        return total + Object.values(timeSpent).reduce((sum, time) => sum + (time || 0), 0);
      }, 0);

      // Get recent activity
      const recentActivity = await Promise.all(
        quizAttempts.slice(0, 5).map(async attempt => {
          return {
            subject: attempt.subject,
            type: 'Quiz Question',
            result: attempt.isCorrect ? 'Correct' : 'Incorrect',
            timestamp: attempt.createdAt
          };
        })
      );

      res.json({
        overallProgress: {
          totalSubjects,
          completedSubjects: subjects.length,
          averageAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
          totalTimeSpent,
          currentStreak
        },
        subjectPerformance,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  return httpServer;
}

function calculateConfidenceScore(
  path: typeof learningPaths.$inferSelect,
  quizAccuracy: number,
  timeSpent: number,
  progress?: typeof learningPathProgress.$inferSelect | null,
  subjectHistory?: { subject: string }[] = []
): number {
  // Start with base score of 70%
  let score = 0.70;

  // Subject history bonus (up to 15%)
  const topics = (path.topics as string[]) || [];
  const mainTopic = topics[0]?.toLowerCase() || path.title.toLowerCase();
  const hasSubjectHistory = subjectHistory?.some(
    h => {
      const historySubject = h.subject.toLowerCase();
      const topicMatch = mainTopic.includes(historySubject) || historySubject.includes(mainTopic);
      return topicMatch;
    }
  );
  if (hasSubjectHistory) {
    score += 0.15; // Higher match for subjects user has studied before
  }

  // Quiz performance (up to 10%)
  score += quizAccuracy * 0.10;

  // Time investment factor (up to 5%)
  const engagementScore = Math.min(timeSpent / (path.estimatedHours * 60), 1);
  score += engagementScore * 0.05;

  // For new users or no progress
  if (!progress) {
    if (path.difficulty === 'beginner') {
      score += 0.10; // Higher match for beginner courses
    } else if (path.difficulty === 'intermediate') {
      score += 0.05; // Medium match for intermediate courses
    }
    return Math.max(0.70, Math.min(1, score));
  }

  // Learning streak bonus (up to 5%)
  const streakBonus = Math.min(progress.streakDays / 14, 1) * 0.05;
  score += streakBonus;

  // Topic mastery (up to 5%)
  const completedTopics = progress.completedTopics as number[];
  const topicMasteryScore = completedTopics.length / topics.length;
  score += topicMasteryScore * 0.05;

  // Difficulty progression (up to 5%)
  if (path.difficulty === 'beginner' && completedTopics.length === 0) {
    score += 0.05; // Perfect for beginners
  } else if (path.difficulty === 'intermediate' && completedTopics.length >= 2) {
    score += 0.05; // Ready for intermediate
  } else if (path.difficulty === 'advanced' && completedTopics.length >= 4) {
    score += 0.05; // Ready for advanced
  }

  // Ensure the score is between 70% and 100%
  return Math.max(0.70, Math.min(1, score));
}

function generateRecommendationReason(
  path: typeof learningPaths.$inferSelect,
  quizAccuracy: number,
  progress?: typeof learningPathProgress.$inferSelect | null
): string {
  const topics = (path.topics as string[]) || [];
  const mainTopic = topics[0] || path.title;

  if (!progress) {
    if (path.difficulty === 'beginner') {
      return `Great starting point for beginners! This ${mainTopic} course will help you build a strong foundation.`;
    }
    return `This ${path.difficulty} level course in ${mainTopic} matches your interests.`;
  }

  const completedTopics = progress.completedTopics as number[];
  const completedCount = completedTopics.length;

  // Tailor message based on user's progress and course difficulty
  if (path.difficulty === 'beginner') {
    if (completedCount === 0) {
      return `Perfect first step! Start your journey with this beginner-friendly ${mainTopic} course.`;
    }
    return `Strengthen your basics with this foundational course in ${mainTopic}.`;
  }

  if (path.difficulty === 'intermediate') {
    if (completedCount >= 2) {
      return `Ready for the next level! Your strong performance in basic courses makes this intermediate ${mainTopic} course a perfect match.`;
    }
    return `Level up your skills with this intermediate course in ${mainTopic}.`;
  }

  if (path.difficulty === 'advanced') {
    if (completedCount >= 4) {
      return `Challenge yourself! Your mastery of intermediate topics makes you ready for this advanced ${mainTopic} course.`;
    }
    if (quizAccuracy > 0.8) {
      return `Your exceptional quiz performance (${Math.round(quizAccuracy * 100)}% accuracy) shows you're ready for this advanced material.`;
    }
  }

  // General recommendation based on learning streak
  if (progress.streakDays >= 7) {
    return `Keep your ${progress.streakDays}-day learning streak going! This ${path.difficulty} course in ${mainTopic} is perfect for your current level.`;
  }

  return `This ${path.difficulty} level course in ${mainTopic} aligns well with your learning progress.`;
}