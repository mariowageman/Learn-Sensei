import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  subject: text("subject").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  answer: text("answer").notNull(),
  subject: text("subject").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const quizProgress = pgTable("quiz_progress", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => quizQuestions.id),
  subject: text("subject").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  userAnswer: text("user_answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  topics: jsonb("topics").notNull(), // Array of topics in order
  prerequisites: jsonb("prerequisites").notNull(), // Array of prerequisite path IDs
  estimatedHours: integer("estimated_hours").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const learningPathProgress = pgTable("learning_path_progress", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id").references(() => learningPaths.id),
  currentTopic: integer("current_topic").notNull(), // Index of current topic in the path
  completed: boolean("completed").notNull().default(false),
  completedTopics: jsonb("completed_topics").notNull(), // Array of completed topic indices
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Relations
export const learningPathsRelations = relations(learningPaths, ({ many }) => ({
  progress: many(learningPathProgress)
}));

export const learningPathProgressRelations = relations(learningPathProgress, ({ one }) => ({
  path: one(learningPaths, {
    fields: [learningPathProgress.pathId],
    references: [learningPaths.id],
  })
}));

// Export schemas
export const insertSessionSchema = createInsertSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);
export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export const insertQuizQuestionSchema = createInsertSchema(quizQuestions);
export const selectQuizQuestionSchema = createSelectSchema(quizQuestions);
export const insertQuizProgressSchema = createInsertSchema(quizProgress);
export const selectQuizProgressSchema = createSelectSchema(quizProgress);
export const insertLearningPathSchema = createInsertSchema(learningPaths);
export const selectLearningPathSchema = createSelectSchema(learningPaths);
export const insertLearningPathProgressSchema = createInsertSchema(learningPathProgress);
export const selectLearningPathProgressSchema = createSelectSchema(learningPathProgress);

// Types
export type Session = typeof sessions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type QuizProgress = typeof quizProgress.$inferSelect;
export type LearningPath = typeof learningPaths.$inferSelect;
export type LearningPathProgress = typeof learningPathProgress.$inferSelect;