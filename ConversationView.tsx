import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Send, User, Headset } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ConversationView() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/conversation/:id");
  const conversationId = params?.id ? parseInt(params.id) : null;
  
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading: convLoading } = trpc.conversations.getById.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  );
  
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = trpc.messages.list.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  );

  const { data: quickReplies } = trpc.quickReplies.list.useQuery(undefined, {
    enabled: user?.role === "atendente" || user?.role === "gerente" || user?.role === "admin"
  });

  const sendMessage = trpc.messages.send.useMutation();
  const markAsRead = trpc.messages.markAsRead.useMutation();

  useEffect(() => {
    if (conversationId && messages) {
      markAsRead.mutate({ conversationId });
    }
  }, [conversationId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (authLoading || convLoading || messagesLoading || !conversationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !conversation) {
    setLocation("/");
    return null;
  }

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Digite uma mensagem");
      return;
    }

    try {
      await sendMessage.mutateAsync({
        conversationId: conversationId,
        content: message.trim(),
      });
      setMessage("");
      refetchMessages();
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    }
  };

  const handleQuickReply = (content: string) => {
    setMessage(content);
  };

  const handleBack = () => {
    if (user.role === "gerente" || user.role === "admin") {
      setLocation("/manager");
    } else if (user.role === "atendente") {
      setLocation("/attendant");
    } else {
      setLocation("/patient");
    }
  };

  const isAttendant = user.role === "atendente" || user.role === "gerente" || user.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{conversation.subject || "Conversa"}</h1>
              <p className="text-sm text-gray-500">
                <Badge variant="outline" className="mr-2">{conversation.status}</Badge>
                Criada em {new Date(conversation.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-4">
            {messages && messages.length > 0 ? (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[70%] ${msg.senderId === user.id ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.senderType === 'atendente' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {msg.senderType === 'atendente' ? (
                        <Headset className="w-4 h-4 text-green-600" />
                      ) : (
                        <User className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <Card className={msg.senderId === user.id ? 'bg-blue-50' : 'bg-white'}>
                        <CardContent className="p-3">
                          <p className="text-sm text-gray-900">{msg.content}</p>
                        </CardContent>
                      </Card>
                      <p className="text-xs text-gray-500 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">Nenhuma mensagem ainda. Inicie a conversa!</p>
                </CardContent>
              </Card>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Message Input Area */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {isAttendant && quickReplies && quickReplies.length > 0 && (
            <div className="mb-3">
              <Select onValueChange={handleQuickReply}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar resposta rápida..." />
                </SelectTrigger>
                <SelectContent>
                  {quickReplies.map(reply => (
                    <SelectItem key={reply.id} value={reply.content}>
                      {reply.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 min-h-[60px] max-h-[120px]"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={sendMessage.isPending || !message.trim()}
              className="self-end"
            >
              {sendMessage.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
