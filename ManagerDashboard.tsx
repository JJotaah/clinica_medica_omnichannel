import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BarChart3, LogOut, Users, MessageSquare, TrendingUp, Clock } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManagerDashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickReplyTitle, setQuickReplyTitle] = useState("");
  const [quickReplyContent, setQuickReplyContent] = useState("");
  const [quickReplyCategory, setQuickReplyCategory] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [selectedAttendant, setSelectedAttendant] = useState<string>("");

  const { data: allConversations, isLoading: conversationsLoading, refetch: refetchConversations } = trpc.conversations.allConversations.useQuery();
  const { data: openConversations, refetch: refetchOpen } = trpc.conversations.openConversations.useQuery();
  const { data: attendants } = trpc.users.attendants.useQuery();
  const { data: channels } = trpc.channels.list.useQuery();
  const createQuickReply = trpc.quickReplies.create.useMutation();
  const assignToAttendant = trpc.conversations.assignToAttendant.useMutation();

  // Redirecionar usuários não autorizados usando useEffect
  useEffect(() => {
    if (!loading && user && user.role !== "gerente" && user.role !== "admin") {
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

  if (!user || (user.role !== "gerente" && user.role !== "admin")) {
    return null;
  }

  const handleCreateQuickReply = async () => {
    if (!quickReplyTitle.trim() || !quickReplyContent.trim()) {
      toast.error("Preencha título e conteúdo");
      return;
    }

    try {
      await createQuickReply.mutateAsync({
        title: quickReplyTitle.trim(),
        content: quickReplyContent.trim(),
        category: quickReplyCategory.trim() || undefined,
      });
      toast.success("Resposta rápida criada!");
      setDialogOpen(false);
      setQuickReplyTitle("");
      setQuickReplyContent("");
      setQuickReplyCategory("");
    } catch (error) {
      toast.error("Erro ao criar resposta rápida");
    }
  };

  const handleAssignConversation = async () => {
    if (!selectedConversation || !selectedAttendant) {
      toast.error("Selecione um atendente");
      return;
    }

    try {
      await assignToAttendant.mutateAsync({
        conversationId: selectedConversation,
        attendantId: parseInt(selectedAttendant),
      });
      toast.success("Conversa atribuída com sucesso!");
      setAssignDialogOpen(false);
      setSelectedConversation(null);
      setSelectedAttendant("");
      refetchConversations();
      refetchOpen();
    } catch (error) {
      toast.error("Erro ao atribuir conversa");
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

  const totalConversations = allConversations?.length || 0;
  const openCount = openConversations?.length || 0;
  const inProgressCount = allConversations?.filter(c => c.status === "in_progress").length || 0;
  const resolvedCount = allConversations?.filter(c => c.status === "resolved" || c.status === "closed").length || 0;
  const attendantCount = attendants?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
              <p className="text-sm text-gray-500">Painel do Gerente</p>
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
        <div className="max-w-7xl mx-auto">
          {/* Metrics Dashboard */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total de Conversas</CardDescription>
                <CardTitle className="text-3xl">{totalConversations}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Todas as conversas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Fila de Espera</CardDescription>
                <CardTitle className="text-3xl text-orange-600">{openCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Aguardando atribuição
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Em Atendimento</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{inProgressCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Sendo atendidas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Atendentes Ativos</CardDescription>
                <CardTitle className="text-3xl text-green-600">{attendantCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  <Users className="w-4 h-4 inline mr-1" />
                  Disponíveis
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Criar Resposta Rápida</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Resposta Rápida</DialogTitle>
                  <DialogDescription>
                    Crie modelos de respostas para agilizar o atendimento
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Confirmação de Agendamento"
                      value={quickReplyTitle}
                      onChange={(e) => setQuickReplyTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria (opcional)</Label>
                    <Input
                      id="category"
                      placeholder="Ex: agendamento"
                      value={quickReplyCategory}
                      onChange={(e) => setQuickReplyCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Conteúdo</Label>
                    <Input
                      id="content"
                      placeholder="Mensagem da resposta rápida"
                      value={quickReplyContent}
                      onChange={(e) => setQuickReplyContent(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateQuickReply} className="w-full" disabled={createQuickReply.isPending}>
                    {createQuickReply.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Conversations Management */}
          <Tabs defaultValue="queue" className="space-y-4">
            <TabsList>
              <TabsTrigger value="queue">
                Fila de Espera ({openCount})
              </TabsTrigger>
              <TabsTrigger value="active">
                Em Atendimento ({inProgressCount})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolvidas ({resolvedCount})
              </TabsTrigger>
              <TabsTrigger value="attendants">
                Atendentes ({attendantCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="space-y-4">
              {openConversations && openConversations.length > 0 ? (
                openConversations.map(conv => (
                  <Card key={conv.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1" onClick={() => setLocation(`/conversation/${conv.id}`)} style={{cursor: 'pointer'}}>
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
                            onClick={() => {
                              setSelectedConversation(conv.id);
                              setAssignDialogOpen(true);
                            }}
                          >
                            Atribuir
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma conversa na fila</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {allConversations?.filter(c => c.status === "in_progress").map(conv => (
                <Card 
                  key={conv.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setLocation(`/conversation/${conv.id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{conv.subject || "Sem assunto"}</CardTitle>
                        <CardDescription>
                          Canal: {getChannelName(conv.channelId)} • 
                          Atendente ID: {conv.attendantId || "N/A"}
                        </CardDescription>
                      </div>
                      {getStatusBadge(conv.status)}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {allConversations?.filter(c => c.status === "resolved" || c.status === "closed").map(conv => (
                <Card 
                  key={conv.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setLocation(`/conversation/${conv.id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{conv.subject || "Sem assunto"}</CardTitle>
                        <CardDescription>
                          Resolvida em {conv.closedAt ? new Date(conv.closedAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </CardDescription>
                      </div>
                      {getStatusBadge(conv.status)}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="attendants" className="space-y-4">
              {attendants && attendants.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {attendants.map(att => (
                    <Card key={att.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{att.name || att.email}</CardTitle>
                        <CardDescription>
                          ID: {att.id} • Último login: {new Date(att.lastSignedIn).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline">{att.role}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum atendente cadastrado</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Conversa</DialogTitle>
            <DialogDescription>
              Selecione um atendente para esta conversa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="attendant">Atendente</Label>
              <Select value={selectedAttendant} onValueChange={setSelectedAttendant}>
                <SelectTrigger id="attendant">
                  <SelectValue placeholder="Selecione um atendente" />
                </SelectTrigger>
                <SelectContent>
                  {attendants?.map(att => (
                    <SelectItem key={att.id} value={att.id.toString()}>
                      {att.name || att.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignConversation} className="w-full" disabled={assignToAttendant.isPending}>
              {assignToAttendant.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atribuindo...
                </>
              ) : (
                "Atribuir"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
