import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
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

export const insertSessionSchema = createInsertSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);
export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export const insertQuizQuestionSchema = createInsertSchema(quizQuestions);
export const selectQuizQuestionSchema = createSelectSchema(quizQuestions);

export type Session = typeof sessions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
