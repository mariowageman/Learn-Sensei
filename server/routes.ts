import express from 'express';
import { Server } from 'http';
import WebSocket from 'ws';
import { db } from '@db';
import { and, eq, sql } from 'drizzle-orm';
import { 
  learningPaths,
  learningPathProgress,
  progressAnalytics,
  sessions,
  subjectHistory,
  quizProgress,
  messages,
  quizQuestions,
  blogPosts,
  users
} from '@db/schema';
import { AVAILABLE_SUBJECTS, fetchCourseraCourses } from './coursera';
import type { Express } from "express";
import { createServer, type Server as HttpServer } from "http";
import type { UploadedFile } from "express-fileupload";
import path from "path";
import { 
  generateExplanation, 
  generateQuestion, 
  checkAnswer 
} from './openai';
import { generateRSSFeed } from './lib/rss';
import type { BlogPostType } from "@db/schema";
import { Client } from "@replit/object-storage";
import type { ObjectStorageOptions } from "@replit/object-storage";
import { usersRouter } from './routes/users';  // Add this import

// Interface extending BlogPostType for frontend use
interface BlogPost extends BlogPostType {
  tags: string[]; // Override tags to be string[] instead of unknown
}

export function registerRoutes(app: Express): HttpServer {
  const httpServer = createServer(app);

  // Register the users router
  app.use(usersRouter);

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    try {
      console.log('Fetching all blog posts');
      const posts = await db.query.blogPosts.findMany({
        orderBy: (posts, { desc }) => [desc(posts.date)]
      });
      console.log('Found posts:', posts.length);
      res.json(posts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.patch("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const { content, title, tags, image } = req.body;

      await db.update(blogPosts)
        .set({
          content,
          title: title || undefined,
          tags: tags || [],
          image: image || undefined,
          updatedAt: new Date()
        })
        .where(eq(blogPosts.slug, slug));

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.post("/api/blog", async (req, res) => {
    try {
      const { slug, title, content, tags, description, category, image } = req.body;

      const post = await db.insert(blogPosts)
        .values({
          slug,
          title,
          content,
          tags,
          description,
          category,
          image,
          date: new Date(),
          authorId: req.user?.id,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      res.json(post[0]);
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      console.log('Fetching blog post with slug:', slug);

      const post = await db.query.blogPosts.findFirst({
        where: eq(blogPosts.slug, slug)
      });

      if (!post) {
        console.log('Post not found for slug:', slug);
        return res.status(404).json({ error: "Blog post not found" });
      }

      console.log('Found post:', post.title);
      res.json(post);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // Test endpoint to verify server is running
  app.delete("/api/blog/:identifier", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, req.session.userId),
        with: {
          role: true
        }
      });

      if (!user || (user.role.name !== 'admin' && user.role.name !== 'moderator')) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const { identifier } = req.params;

      // Check if identifier is a number (ID) or string (slug)
      if (!isNaN(Number(identifier))) {
        await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(identifier)));
      } else {
        await db.delete(blogPosts).where(eq(blogPosts.slug, identifier));
      }

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
  });

  // File upload endpoint with improved error handling and logging
  app.post("/api/upload", async (req, res) => {
    try {
      console.log('Starting file upload process');

      if (!req.files || !req.files.image) {
        console.error('No file uploaded');
        return res.status(400).json({ error: "No image file uploaded" });
      }

      const bucketId = process.env.REPLIT_OBJECT_STORAGE_BUCKET_ID;
      const replitToken = process.env.REPLIT_TOKEN;

      if (!bucketId || !replitToken) {
        console.error('Storage configuration missing:', { bucketId: !!bucketId, token: !!replitToken });
        return res.status(500).json({ error: "Storage configuration incomplete" });
      }

      const storage = new Client({
        bucketId,
        apiToken: replitToken
      } as ObjectStorageClientOptions);
      const file = req.files.image as UploadedFile;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        console.error('Invalid file type:', file.mimetype);
        return res.status(400).json({ error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filename = `blog_images/${timestamp}_${safeFilename}`;

      console.log('Attempting to upload file:', filename);

      try {
        console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.mimetype);
        const fileBuffer = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data);

        if (!fileBuffer || fileBuffer.length === 0) {
          console.error('Empty file buffer');
          return res.status(400).json({ error: "Invalid file data" });
        }
        await storage.write(filename, fileBuffer, {
          public: true,
          contentType: file.mimetype,
          metadata: {
            originalName: file.name
          }
        });
      } catch (err) {
        console.error('Storage write error:', err);
        throw new Error('Failed to upload file to storage');
      }
      console.log('File uploaded to storage successfully');

      // Generate public URL using the correct bucket URL format
      const url = `https://${bucketId}.replit.dev/${encodeURIComponent(filename)}`;
      console.log('Generated URL:', url);

      res.json({ url });
    } catch (error) {
      console.error('Upload process error:', error);
      res.status(500).json({ error: "Failed to process upload", details: (error as Error).message });
    }
  });

  // RSS feed endpoint
  app.get("/feed.xml", async (req, res) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const baseUrl = `${protocol}://${req.get('host')}`;
      const feed = await generateRSSFeed(baseUrl);
      res.set('Content-Type', 'application/xml');
      res.send(feed);
    } catch (error) {
      console.error('Error generating RSS feed:', error);
      res.status(500).send('Error generating RSS feed');
    }
  });

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
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const question = await db.query.quizQuestions.findFirst({
      where: eq(quizQuestions.id, questionId)
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    try {
      const result = await checkAnswer(question.text, question.answer, answer);
      console.log('Answer check result:', result);

      // Get or create learning path progress with userId
      let learningPath = await db.query.learningPaths.findFirst({
        where: eq(learningPaths.title, question.subject),
        with: {
          progress: {
            where: eq(learningPathProgress.userId, userId),
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
        learningPath = {
          ...newPath,
          progress: []
        };
      }

      let pathProgress = learningPath.progress?.[0];

      if (!pathProgress) {
        const [newProgress] = await db.insert(learningPathProgress).values({
          userId,
          pathId: learningPath.id,
          currentTopic: 0,
          completed: false,
          completedTopics: [],
          timeSpentMinutes: { quiz: 0 },
          streakDays: 1,
          lastStreakDate: new Date()
        }).returning();
        pathProgress = newProgress;
      }

      // Save quiz progress
      await db.insert(quizProgress).values({
        userId,
        questionId,
        subject: question.subject,
        isCorrect: result.correct,
        userAnswer: answer,
        videoSuggestions: result.videoSuggestions || []
      });

      // Send response with feedback and video suggestions
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
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      let progressQuery = db.query.quizProgress;
      let whereClause = eq(quizProgress.userId, userId);

      if (subject !== 'all') {
        whereClause = eq(quizProgress.subject, subject);
      }

      const progress = await progressQuery.findMany({
        where: whereClause,
        with: {
          question: true
        },
        orderBy: (quizProgress, { desc }) => [desc(quizProgress.createdAt)]
      });

      // Get unique subjects
      const subjects = [...new Set(progress.map(p => p.subject))];

      // Calculate total stats
      const total = progress.length;
      const correct = progress.filter(p => p.isCorrect).length;
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

      // Calculate time spent and streak
      const pathsData = await db.query.learningPaths.findMany({
        where: subject !== 'all' ? eq(learningPaths.title, subject) : undefined,
        with: {
          progress: {
            orderBy: (progress, { desc }) => [desc(progress.updatedAt)]
          }
        }
      });

      let timeSpentMinutes = 0;
      let streakDays = 0;

      pathsData.forEach(path => {
        if (path.progress?.[0]) {
          const pathProgress = path.progress[0];
          const timeSpentObj = pathProgress.timeSpentMinutes as Record<string, number>;
          timeSpentMinutes += Object.values(timeSpentObj).reduce((sum, time) => sum + (time || 0), 0);
          streakDays = Math.max(streakDays, pathProgress.streakDays || 0);
        }
      });

      // Calculate weekly progress
      const weeklyProgress = await db.query.progressAnalytics.findMany({
        where: and(
          subject !== 'all' ? eq(progressAnalytics.pathId, pathsData[0]?.id ?? 0) : undefined,
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

      // Format recent attempts with full details
      const recentAttempts = progress.map(attempt => ({
        id: attempt.id,
        isCorrect: attempt.isCorrect,
        userAnswer: attempt.userAnswer,
        createdAt: attempt.createdAt,
        questionText: attempt.question?.text || '',
        correctAnswer: attempt.question?.answer || '',
        subject: attempt.subject,
        videoSuggestions: attempt.videoSuggestions || []
      }));

      res.json({
        total,
        correct,
        percentage,
        timeSpentMinutes: timeSpentMinutes || 0,
        streakDays: streakDays || 0,
        avgAccuracy,
        subjects,
        weeklyProgress: weeklyProgress.map(day => ({
          date: day.date,
          correct: day.correctAnswers,
          total: day.totalAttempts
        })),
        recentAttempts
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

        // Get quiz performance data to identify areas for improvement
        const quizPerformance = await db.query.quizProgress.findMany({
          orderBy: (quiz, { desc }) => [desc(quiz.createdAt)]
        });

        // If user has history, fetch courses based on their interests
        if (recentSubjects.length > 0) {
          console.log('Fetching recommended courses based on recent subjects:', recentSubjects.map(s => s.subject));

          // Group quiz performance by subject
          const subjectPerformance = quizPerformance.reduce((acc, quiz) => {
            if (!acc[quiz.subject]) {
              acc[quiz.subject] = {
                total: 0,
                correct: 0
              };
            }
            acc[quiz.subject].total++;
            if (quiz.isCorrect) acc[quiz.subject].correct++;
            return acc;
          }, {} as Record<string, { total: number; correct: number }>);

          // Identify subjects where user needs improvement (accuracy < 70%)
          const improvementSubjects = Object.entries(subjectPerformance)
            .filter(([_, stats]) => (stats.correct / stats.total) < 0.7)
            .map(([subject]) => subject);

          // Combine recent subjects and improvement subjects
          const allTargetSubjects = [...new Set([
            ...recentSubjects.map(s => s.subject),
            ...improvementSubjects
          ])];

          // Fetch courses for each subject
          const allRecommendedCourses = await Promise.all(
            allTargetSubjects.map(async (subject) => {
              const courses = await fetchCourseraCourses(subject);
              // Take more courses from subjects with lower performance
              const isImprovementSubject = improvementSubjects.includes(subject);
              return courses.slice(0, isImprovementSubject ? 4 : 2); // Take more courses for improvement areas
            })
          );

          // Flatten and deduplicate courses based on course ID, excluding sample courses
          const seenCourseIds = new Set<string>();
          const uniqueCourses = allRecommendedCourses.flat().filter(course => {
            // Skip if already seen
            if (seenCourseIds.has(course.id)) {
              return false;
            }
            // Skip sample courses
            if (
              course.id.startsWith('sample-') ||
              course.instructors?.[0]?.fullName?.includes('John Doe') ||
              course.partners?.[0]?.name === 'Example University'
            ) {
              return false;
            }
            seenCourseIds.add(course.id);
            return true;
          });

          // If no real courses found after filtering, return empty array
          if (uniqueCourses.length === 0) {
            return res.json([]);
          }

          // Sort courses prioritizing those for improvement subjects
          const sortedCourses = uniqueCourses.sort((a, b) => {
            const aIsImprovement = improvementSubjects.some(subject =>
              a.name.toLowerCase().includes(subject.toLowerCase()));
            const bIsImprovement = improvementSubjects.some(subject =>
              b.name.toLowerCase().includes(subject.toLowerCase()));

            if (aIsImprovement && !bIsImprovement) return -1;
            if (!aIsImprovement && bIsImprovement) return 1;
            return 0;
          });

          // Transform Coursera courses into our learning path format
          const paths = sortedCourses.map(course => {
            // Parse workload hours with better fallback handling
            let estimatedHours = 10; // Default fallback of 10 hours
            if (course.workload) {
              const hourMatch = course.workload.match(/(\d+).*?hour/i);
              if (hourMatch) {
                estimatedHours = parseInt(hourMatch[1]);
              } else {
                // Try to parse just the first number if no "hour" keyword found
                const numberMatch = course.workload.match(/(\d+)/);
                if (numberMatch) {
                  estimatedHours = parseInt(numberMatch[1]);
                }
              }
            }

            return {
              id: parseInt(course.id),
              title: course.name,
              description: course.description,
              difficulty: course.specializations?.length ? "advanced" : "intermediate",
              topics: course.primaryLanguages || [],
              prerequisites: [],
              estimatedHours: Math.max(estimatedHours, 1), // Ensure at least 1 hour
              instructor: course.instructors[0]?.fullName,
              partner: course.partners[0]?.name,
              photoUrl: course.photoUrl,
              externalLink: `https://www.coursera.org/learn/${course.slug}`
            };
          });

          return res.json(paths);
        }
      } else {
        console.log('Fetching courses for subject:', subject);
        const courses = await fetchCourseraCourses(subject);

        // Filter out sample/example courses
        const filteredCourses = courses.filter(course =>
          !course.id.startsWith('sample-') &&
          !course.instructors?.[0]?.fullName?.includes('John Doe') &&
          !course.partners?.[0]?.name?.includes('Example University')
        );

        // If no real courses found after filtering, return empty array
        if (filteredCourses.length === 0) {
          return res.json([]);
        }

        // Transform Coursera courses into our learning path format
        const paths = filteredCourses.map(course => {
          // Parse workload hours with better fallback handling
          let estimatedHours = 10; // Default fallback of 10 hours
          if (course.workload) {
            const hourMatch = course.workload.match(/(\d+).*?hour/i);
            if (hourMatch) {
              estimatedHours = parseInt(hourMatch[1]);
            } else {
              // Try to parse just the first number if no "hour" keyword found
              const numberMatch = course.workload.match(/(\d+)/);
              if (numberMatch) {
                estimatedHours = parseInt(numberMatch[1]);
              }
            }
          }

          // Ensure valid course URL
          const courseSlug = course.slug?.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
          const externalLink = courseSlug
            ? `https://www.coursera.org/learn/${courseSlug}`
            : `https://www.coursera.org/courses?query=${encodeURIComponent(course.name)}`;

          return {
            id: parseInt(course.id),
            title: course.name,
            description: course.description,
            difficulty: course.specializations?.length ? "advanced" : "intermediate",
            topics: course.primaryLanguages || [],
            prerequisites: [],
            estimatedHours: Math.max(estimatedHours, 1), // Ensure at least 1 hour
            instructor: course.instructors[0]?.fullName,
            partner: course.partners[0]?.name,
            photoUrl: course.photoUrl,
            externalLink
          };
        });

        res.json(paths);
      }
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

      // Update progress with type safety
      const completedTopics = Array.isArray(currentProgress.completedTopics)
        ? currentProgress.completedTopics
        : [];
      const updatedCompletedTopics = Array.from(new Set([...completedTopics, completedTopic]));
      const topics = Array.isArray(path.topics) ? path.topics : [];
      const isCompleted = updatedCompletedTopics.length >= topics.length;
      const nextTopic = isCompleted ? completedTopic : completedTopic + 1;

      // Update time spent with type safety
      const currentTimeSpent = (typeof currentProgress.timeSpentMinutes === 'object' && currentProgress.timeSpentMinutes)
        ? currentProgress.timeSpentMinutes as Record<string, number>
        : {};
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
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      // Get user's progress across all learning paths
      const progress = await db.query.learningPathProgress.findMany({
        where: eq(learningPathProgress.userId, userId),
        orderBy: (progress, { desc }) => [desc(progress.updatedAt)]
      });

      // Get quiz performance data
      const quizPerformance = await db.query.quizProgress.findMany({
        where: eq(quizProgress.userId, userId),
        orderBy: (quiz, { desc }) => [desc(quiz.createdAt)]
      });

      // Get subject history
      const subjectHistory = await db.query.subjectHistory.findMany({
        where: eq(subjectHistory.userId, userId),
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
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      console.log('Fetching recent subjects for user:', userId);
      const recentSubjects = await db.query.subjectHistory.findMany({
        where: eq(subjectHistory.userId, userId),
        orderBy: (history, { desc }) => [desc(history.createdAt)],
        limit: 20
      });
      console.log(`Found ${recentSubjects.length} recent subjects for user ${userId}`);
      res.json(recentSubjects);
    } catch (error) {
      console.error('Error fetching recent subjects:', error);
      res.status(500).json({ error: "Failed to fetch recent subjects" });
    }
  });

  app.post("/api/session", async (req, res) => {
    const { subject } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      // Save to session
      const [session] = await db.insert(sessions).values({
        subject,
        userId // Add userId to sessions
      }).returning();

      // Save to history with userId
      console.log('Saving subject to history:', subject, 'for user:', userId);
      await db.insert(subjectHistory).values({
        subject,
        userId
      });

      // Return both session and updated history filtered by userId
      const history = await db.query.subjectHistory.findMany({
        where: eq(subjectHistory.userId, userId),
        orderBy: (history, { desc }) => [desc(history.createdAt)],
        limit: 10
      });

      res.json({
        session,
        history
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.get("/api/dashboard", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get all quiz attempts for the user
      const quizAttempts = await db.query.quizProgress.findMany({
        where: eq(quizProgress.userId, userId),
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

// Helper functions
function calculateConfidenceScore(
  path: typeof learningPaths.$inferSelect,
  quizAccuracy: number,
  timeSpent: number,
  progress?: typeof learningPathProgress.$inferSelect | null,
  subjectHistory: { subject: string }[] = []
): number {
  let score = 0.70;

  const topics = (path.topics as string[]) || [];
  const mainTopic = topics[0]?.toLowerCase() || path.title.toLowerCase();

  const hasSubjectHistory = subjectHistory?.some(h => {
    const historySubject = h.subject.toLowerCase();
    return mainTopic.includes(historySubject) || historySubject.includes(mainTopic);
  });

  if (hasSubjectHistory) score += 0.15;
  score += quizAccuracy * 0.10;
  score += Math.min(timeSpent / (path.estimatedHours * 60), 1) * 0.05;

  if (!progress) {
    if (path.difficulty === 'beginner') score += 0.10;
    else if (path.difficulty === 'intermediate') score += 0.05;
    return Math.max(0.70, Math.min(1, score));
  }

  score += Math.min(progress.streakDays / 14, 1) * 0.05;

  const completedTopics = progress.completedTopics as number[];
  score += (completedTopics.length / topics.length) * 0.05;

  if (path.difficulty === 'beginner' && completedTopics.length === 0) score += 0.05;
  else if (path.difficulty === 'intermediate' && completedTopics.length >= 2) score += 0.05;
  else if (path.difficulty === 'advanced' && completedTopics.length >= 4) score += 0.05;

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
    return `This ${path.difficulty} level course in ${mainTopic} matches yourinterests.`;
  }

  const completedTopics = progress.completedTopics as number[];
  const completedCount = completedTopics.length;

  if (path.difficulty === 'beginner') {
    if (completedCount === 0) {
      return `Perfect first step! Start your journey with this beginner-friendly ${mainTopic} course.`;
    }
    return `Strengthen your basics with this foundational course in ${mainTopic}.`;
  }

  if (path.difficulty === 'intermediate') {
    if (completedCount >= 2) {
      return `Ready for the next level! This ${mainTopic} course will build on your existing knowledge.`;
    }
    return `This intermediate course in ${mainTopic} will help you advance your skills.`;
  }

  return `This ${path.difficulty} level course in ${mainTopic} aligns well with your learning progress.`;
}