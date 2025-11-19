import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role field for access control (paciente, atendente, gerente)
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "paciente", "atendente", "gerente"]).default("paciente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Canais de atendimento disponíveis (WhatsApp, Instagram, Facebook, Email, Chat)
 */
export const channels = mysqlTable("channels", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // WhatsApp, Instagram, Facebook, Email, Chat
  identifier: varchar("identifier", { length: 50 }).notNull().unique(), // whatsapp, instagram, facebook, email, chat
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Channel = typeof channels.$inferSelect;
export type InsertChannel = typeof channels.$inferInsert;

/**
 * Conversas entre pacientes e atendentes
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(), // ID do paciente (user)
  attendantId: int("attendantId"), // ID do atendente responsável (pode ser null se não atribuído)
  channelId: int("channelId").notNull(), // Canal de origem
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  subject: varchar("subject", { length: 255 }), // Assunto da conversa
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  closedAt: timestamp("closedAt"),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Mensagens dentro de cada conversa
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(), // ID do usuário que enviou (pode ser paciente ou atendente)
  senderType: mysqlEnum("senderType", ["paciente", "atendente", "system"]).notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Respostas rápidas para atendentes
 */
export const quickReplies = mysqlTable("quickReplies", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }), // agendamento, exames, informações, etc
  createdBy: int("createdBy").notNull(), // ID do gerente que criou
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuickReply = typeof quickReplies.$inferSelect;
export type InsertQuickReply = typeof quickReplies.$inferInsert;

/**
 * Métricas de atendimento por atendente
 */
export const attendanceMetrics = mysqlTable("attendanceMetrics", {
  id: int("id").autoincrement().primaryKey(),
  attendantId: int("attendantId").notNull(),
  date: timestamp("date").notNull(), // Data da métrica
  totalConversations: int("totalConversations").default(0).notNull(),
  resolvedConversations: int("resolvedConversations").default(0).notNull(),
  averageResponseTime: int("averageResponseTime").default(0).notNull(), // Em minutos
  totalMessages: int("totalMessages").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AttendanceMetric = typeof attendanceMetrics.$inferSelect;
export type InsertAttendanceMetric = typeof attendanceMetrics.$inferInsert;

/**
 * Notas e informações adicionais sobre atendimentos
 */
export const conversationNotes = mysqlTable("conversationNotes", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  attendantId: int("attendantId").notNull(),
  note: text("note").notNull(),
  noteType: mysqlEnum("noteType", ["general", "appointment", "exam", "followup"]).default("general").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConversationNote = typeof conversationNotes.$inferSelect;
export type InsertConversationNote = typeof conversationNotes.$inferInsert;
