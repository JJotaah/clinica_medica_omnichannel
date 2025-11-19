import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Plus, LogOut } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function PatientDashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [channelId, setChannelId] = useState<string>("");

  const { data: conversations, isLoading: conversationsLoading, refetch } = trpc.conversations.myConversations.useQuery();
  const { data: channels } = trpc.channels.list.useQuery();
  const createConversation = trpc.conversations.create.useMutation();

  // Redirecionar usuários não autorizados usando useEffect
  useEffect(() => {
    if (!loading && user && user.role !== "paciente" && user.role !== "user") {
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

  if (!user || (user.role !== "paciente" && user.role !== "user")) {
    return null;
  }

  const handleCreateConversation = async () => {
    if (!channelId || !subject.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createConversation.mutateAsync({
        channelId: parseInt(channelId),
        subject: subject.trim(),
      });
      toast.success("Conversa iniciada com sucesso!");
      setDialogOpen(false);
      setSubject("");
      setChannelId("");
      refetch();
    } catch (error) {
      toast.error("Erro ao criar conversa");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
              <p className="text-sm text-gray-500">Painel do Paciente</p>
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
        <div className="max-w-4xl mx-auto">
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Minhas Conversas</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conversa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Iniciar Nova Conversa</DialogTitle>
                  <DialogDescription>
                    Escolha o canal de atendimento e descreva o assunto
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="channel">Canal de Atendimento</Label>
                    <Select value={channelId} onValueChange={setChannelId}>
                      <SelectTrigger id="channel">
                        <SelectValue placeholder="Selecione um canal" />
                      </SelectTrigger>
                      <SelectContent>
                        {channels?.map(channel => (
                          <SelectItem key={channel.id} value={channel.id.toString()}>
                            {channel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      placeholder="Ex: Agendamento de consulta"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateConversation} className="w-full" disabled={createConversation.isPending}>
                    {createConversation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Iniciar Conversa"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Conversations List */}
          <div className="space-y-4">
            {conversations && conversations.length > 0 ? (
              conversations.map(conv => (
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
                          Criada em {new Date(conv.createdAt).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      {getStatusBadge(conv.status)}
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
                  <p className="text-gray-600 mb-4">Você ainda não tem conversas</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Iniciar Primeira Conversa
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
