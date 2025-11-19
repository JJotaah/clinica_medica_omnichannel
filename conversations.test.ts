import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: "paciente" | "atendente" | "gerente" | "admin" = "paciente"): TrpcContext {
  const user: AuthenticatedUser = {
    id: role === "atendente" ? 2 : role === "gerente" ? 3 : 1,
    openId: `sample-${role}`,
    email: `${role}@example.com`,
    name: `Sample ${role}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Conversations Router", () => {
  it("should allow authenticated users to access channels list", async () => {
    const ctx = createContext("paciente");
    const caller = appRouter.createCaller(ctx);

    const channels = await caller.channels.list();
    
    expect(channels).toBeDefined();
    expect(Array.isArray(channels)).toBe(true);
  });

  it("should allow paciente to query their own conversations", async () => {
    const ctx = createContext("paciente");
    const caller = appRouter.createCaller(ctx);

    const conversations = await caller.conversations.myConversations();
    
    expect(conversations).toBeDefined();
    expect(Array.isArray(conversations)).toBe(true);
  });

  it("should allow atendente to query assigned conversations", async () => {
    const ctx = createContext("atendente");
    const caller = appRouter.createCaller(ctx);

    const conversations = await caller.conversations.myAssignedConversations();
    
    expect(conversations).toBeDefined();
    expect(Array.isArray(conversations)).toBe(true);
  });

  it("should allow gerente to query all conversations", async () => {
    const ctx = createContext("gerente");
    const caller = appRouter.createCaller(ctx);

    const conversations = await caller.conversations.allConversations();
    
    expect(conversations).toBeDefined();
    expect(Array.isArray(conversations)).toBe(true);
  });

  it("should allow gerente to query open conversations", async () => {
    const ctx = createContext("gerente");
    const caller = appRouter.createCaller(ctx);

    const conversations = await caller.conversations.openConversations();
    
    expect(conversations).toBeDefined();
    expect(Array.isArray(conversations)).toBe(true);
  });

  it("should deny paciente access to all conversations", async () => {
    const ctx = createContext("paciente");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.conversations.allConversations()).rejects.toThrow();
  });

  it("should deny paciente access to attendant procedures", async () => {
    const ctx = createContext("paciente");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.conversations.myAssignedConversations()).rejects.toThrow();
  });
});

describe("Quick Replies Router", () => {
  it("should allow atendente to list quick replies", async () => {
    const ctx = createContext("atendente");
    const caller = appRouter.createCaller(ctx);

    const replies = await caller.quickReplies.list();
    
    expect(replies).toBeDefined();
    expect(Array.isArray(replies)).toBe(true);
  });

  it("should deny paciente access to quick replies", async () => {
    const ctx = createContext("paciente");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.quickReplies.list()).rejects.toThrow();
  });

  it("should allow gerente to create quick replies", async () => {
    const ctx = createContext("gerente");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quickReplies.create({
      title: "Test Reply",
      content: "This is a test quick reply",
      category: "test",
    });
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});

describe("Users Router", () => {
  it("should allow gerente to list attendants", async () => {
    const ctx = createContext("gerente");
    const caller = appRouter.createCaller(ctx);

    const attendants = await caller.users.attendants();
    
    expect(attendants).toBeDefined();
    expect(Array.isArray(attendants)).toBe(true);
  });

  it("should deny atendente access to user management", async () => {
    const ctx = createContext("atendente");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.users.attendants()).rejects.toThrow();
  });
});
