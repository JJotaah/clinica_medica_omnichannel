import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

// Middleware para verificar role de atendente
const attendantProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'atendente' && ctx.user.role !== 'gerente' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a atendentes' });
  }
  return next({ ctx });
});

// Middleware para verificar role de gerente
const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'gerente' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a gerentes' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== CHANNELS =====
  channels: router({
    list: publicProcedure.query(async () => {
      return await db.getAllChannels();
    }),
  }),

  // ===== CONVERSATIONS =====
  conversations: router({
    // Paciente: listar suas próprias conversas
    myConversations: protectedProcedure.query(async ({ ctx }) => {
      return await db.getConversationsByPatient(ctx.user.id);
    }),

    // Atendente: listar conversas atribuídas
    myAssignedConversations: attendantProcedure.query(async ({ ctx }) => {
      return await db.getConversationsByAttendant(ctx.user.id);
    }),

    // Gerente: listar todas as conversas
    allConversations: managerProcedure.query(async () => {
      return await db.getAllConversations();
    }),

    // Gerente: listar conversas abertas (fila)
    openConversations: managerProcedure.query(async () => {
      return await db.getOpenConversations();
    }),

    // Criar nova conversa
    create: protectedProcedure
      .input(z.object({
        channelId: z.number(),
        subject: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createConversation({
          patientId: ctx.user.id,
          channelId: input.channelId,
          subject: input.subject,
          priority: input.priority || "medium",
          status: "open",
        });
      }),

    // Atualizar status da conversa
    updateStatus: attendantProcedure
      .input(z.object({
        conversationId: z.number(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateConversationStatus(input.conversationId, input.status);
        return { success: true };
      }),

    // Gerente: atribuir conversa a atendente
    assignToAttendant: managerProcedure
      .input(z.object({
        conversationId: z.number(),
        attendantId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateConversationStatus(input.conversationId, "in_progress", input.attendantId);
        return { success: true };
      }),

    // Obter detalhes de uma conversa
    getById: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getConversationById(input.conversationId);
      }),
  }),

  // ===== MESSAGES =====
  messages: router({
    // Listar mensagens de uma conversa
    list: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMessagesByConversation(input.conversationId);
      }),

    // Enviar mensagem
    send: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getConversationById(input.conversationId);
        if (!conversation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversa não encontrada' });
        }

        // Determinar tipo de remetente
        let senderType: "paciente" | "atendente" | "system" = "paciente";
        if (ctx.user.role === "atendente" || ctx.user.role === "gerente") {
          senderType = "atendente";
        }

        return await db.createMessage({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          senderType,
          content: input.content,
          isRead: false,
        });
      }),

    // Marcar mensagens como lidas
    markAsRead: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markMessagesAsRead(input.conversationId);
        return { success: true };
      }),
  }),

  // ===== QUICK REPLIES =====
  quickReplies: router({
    list: attendantProcedure.query(async () => {
      return await db.getActiveQuickReplies();
    }),

    create: managerProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createQuickReply({
          ...input,
          createdBy: ctx.user.id,
          active: true,
        });
        return { success: true };
      }),
  }),

  // ===== CONVERSATION NOTES =====
  notes: router({
    list: attendantProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotesByConversation(input.conversationId);
      }),

    create: attendantProcedure
      .input(z.object({
        conversationId: z.number(),
        note: z.string().min(1),
        noteType: z.enum(["general", "appointment", "exam", "followup"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createConversationNote({
          conversationId: input.conversationId,
          attendantId: ctx.user.id,
          note: input.note,
          noteType: input.noteType || "general",
        });
        return { success: true };
      }),
  }),

  // ===== METRICS =====
  metrics: router({
    // Métricas de um atendente específico
    byAttendant: managerProcedure
      .input(z.object({
        attendantId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getMetricsByAttendant(input.attendantId, input.startDate, input.endDate);
      }),

    // Métricas gerais
    overall: managerProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getAllMetrics(input.startDate, input.endDate);
      }),
  }),

  // ===== USERS =====
  users: router({
    // Listar atendentes
    attendants: managerProcedure.query(async () => {
      return await db.getUsersByRole("atendente");
    }),

    // Atualizar role de usuário
    updateRole: managerProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["paciente", "atendente", "gerente"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
