import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  channels, InsertChannel,
  conversations, InsertConversation,
  messages, InsertMessage,
  quickReplies, InsertQuickReply,
  attendanceMetrics, InsertAttendanceMetric,
  conversationNotes, InsertConversationNote
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== CHANNELS =====
export async function getAllChannels() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(channels).where(eq(channels.active, true));
}

export async function createChannel(channel: InsertChannel) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(channels).values(channel);
}

// ===== CONVERSATIONS =====
export async function getConversationsByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(conversations)
    .where(eq(conversations.patientId, patientId))
    .orderBy(desc(conversations.updatedAt));
}

export async function getConversationsByAttendant(attendantId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(conversations)
    .where(eq(conversations.attendantId, attendantId))
    .orderBy(desc(conversations.updatedAt));
}

export async function getOpenConversations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(conversations)
    .where(eq(conversations.status, "open"))
    .orderBy(desc(conversations.createdAt));
}

export async function getAllConversations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(conversations)
    .orderBy(desc(conversations.updatedAt));
}

export async function createConversation(conversation: InsertConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(conversations).values(conversation);
  return result;
}

export async function updateConversationStatus(conversationId: number, status: string, attendantId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status, updatedAt: new Date() };
  if (attendantId !== undefined) {
    updateData.attendantId = attendantId;
  }
  if (status === "closed" || status === "resolved") {
    updateData.closedAt = new Date();
  }
  
  await db.update(conversations)
    .set(updateData)
    .where(eq(conversations.id, conversationId));
}

export async function getConversationById(conversationId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ===== MESSAGES =====
export async function getMessagesByConversation(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messages).values(message);
  
  // Atualizar timestamp da conversa
  await db.update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, message.conversationId));
  
  return result;
}

export async function markMessagesAsRead(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(messages)
    .set({ isRead: true })
    .where(and(
      eq(messages.conversationId, conversationId),
      eq(messages.isRead, false)
    ));
}

// ===== QUICK REPLIES =====
export async function getActiveQuickReplies() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quickReplies)
    .where(eq(quickReplies.active, true))
    .orderBy(quickReplies.category, quickReplies.title);
}

export async function createQuickReply(reply: InsertQuickReply) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(quickReplies).values(reply);
}

// ===== CONVERSATION NOTES =====
export async function getNotesByConversation(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(conversationNotes)
    .where(eq(conversationNotes.conversationId, conversationId))
    .orderBy(desc(conversationNotes.createdAt));
}

export async function createConversationNote(note: InsertConversationNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(conversationNotes).values(note);
}

// ===== ATTENDANCE METRICS =====
export async function getMetricsByAttendant(attendantId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(attendanceMetrics)
    .where(and(
      eq(attendanceMetrics.attendantId, attendantId),
      sql`${attendanceMetrics.date} >= ${startDate}`,
      sql`${attendanceMetrics.date} <= ${endDate}`
    ))
    .orderBy(desc(attendanceMetrics.date));
}

export async function getAllMetrics(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(attendanceMetrics)
    .where(and(
      sql`${attendanceMetrics.date} >= ${startDate}`,
      sql`${attendanceMetrics.date} <= ${endDate}`
    ))
    .orderBy(desc(attendanceMetrics.date));
}

export async function createOrUpdateMetric(metric: InsertAttendanceMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(attendanceMetrics)
    .where(and(
      eq(attendanceMetrics.attendantId, metric.attendantId),
      eq(attendanceMetrics.date, metric.date)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(attendanceMetrics)
      .set(metric)
      .where(eq(attendanceMetrics.id, existing[0].id));
  } else {
    await db.insert(attendanceMetrics).values(metric);
  }
}

// ===== USERS BY ROLE =====
export async function getUsersByRole(role: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users)
    .where(sql`${users.role} = ${role}`);
}

export async function updateUserRole(userId: number, role: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users)
    .set({ role: role as any })
    .where(eq(users.id, userId));
}
