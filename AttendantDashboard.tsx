import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare, LogOut, CheckCircle, Clock } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useEffect } from "react";

export default function AttendantDashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: conversations, isLoading: conversationsLoading, refetch } = trpc.conversations.myAssignedConversations.useQuery();
  const { data: channels } = trpc.channels.list.useQuery();
  const { data: quickReplies } = trpc.quickReplies.list.useQuery();
  const updateStatus = trpc.conversations.updateStatus.useMutation();

  // Redirecionar usuários não autorizados usando useEffect
  useEffect(() => {
    if (!loading && user && user.role !== "atendente" && user.role !== "gerente" && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading || conversationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || (user.role !== "atendente" && user.role !== "gerente" && user.role !== "admin")) {
    return null;
  }

  const handleResolveConversation = async (conversationId: number) => {
    try {
      await updateStatus.mutateAsync({
        conversationId,
        status: "resolved",
      });
      toast.success("Conversa marcada como resolvida!");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar conversa");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      open: { variant: "outline", label: "Aberta" },
      in_progress: { variant: "default", label: "Em Atendimento" },
      resolved: { variant: "secondary", label: "Resolvida" },
      closed: { variant: "secondary", label: "Fechada" },
    };
    const config = variants[status] || variants.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getChannelName = (id: number) => {
    return channels?.find(c => c.id === id)?.name || "Desconhecido";
  };

  const activeConversations = conversations?.filter(c => c.status === "in_progress") || [];
  const resolvedConversations = conversations?.filter(c => c.status === "resolved" || c.status === "closed") || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
              <p className="text-sm text-gray-500">Painel do Atendente</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Olá, {user.name || user.email}</span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Atendimentos Ativos</CardDescription>
                <CardTitle className="text-3xl">{activeConversations.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Em andamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Resolvidos Hoje</CardDescription>
                <CardTitle className="text-3xl">{resolvedConversations.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Concluídos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Respostas Rápidas</CardDescription>
                <CardTitle className="text-3xl">{quickReplies?.length || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Disponíveis para uso</p>
              </CardContent>
            </Card>
          </div>

          {/* Conversations Tabs */}
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">
                Ativos ({activeConversations.length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolvidos ({resolvedConversations.length})
              </TabsTrigger>
              <TabsTrigger value="quick-replies">
                Respostas Rápidas ({quickReplies?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeConversations.length > 0 ? (
                activeConversations.map(conv => (
                  <Card 
                    key={conv.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1" onClick={() => setLocation(`/conversation/${conv.id}`)}>
                          <CardTitle className="text-lg">{conv.subject || "Sem assunto"}</CardTitle>
                          <CardDescription>
                            Canal: {getChannelName(conv.channelId)} • 
                            Criada em {new Date(conv.createdAt).toLocaleDateString('pt-BR')}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(conv.status)}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolveConversation(conv.id);
                            }}
                            disabled={updateStatus.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Última atualização: {new Date(conv.updatedAt).toLocaleString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum atendimento ativo no momento</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {resolvedConversations.length > 0 ? (
                resolvedConversations.map(conv => (
                  <Card 
                    key={conv.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setLocation(`/conversation/${conv.id}`)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{conv.subject || "Sem assunto"}</CardTitle>
                          <CardDescription>
                            Canal: {getChannelName(conv.channelId)} • 
                            Resolvida em {conv.closedAt ? new Date(conv.closedAt).toLocaleDateString('pt-BR') : 'N/A'}
                          </CardDescription>
                        </div>
                        {getStatusBadge(conv.status)}
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma conversa resolvida ainda</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="quick-replies" className="space-y-4">
              {quickReplies && quickReplies.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {quickReplies.map(reply => (
                    <Card key={reply.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{reply.title}</CardTitle>
                            {reply.category && (
                              <Badge variant="outline" className="mt-2">{reply.category}</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{reply.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma resposta rápida cadastrada</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
