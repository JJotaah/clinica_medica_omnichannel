import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageSquare, Users, BarChart3 } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Redirecionar baseado no role
      if (user.role === "gerente" || user.role === "admin") {
        setLocation("/manager");
      } else if (user.role === "atendente") {
        setLocation("/attendant");
      } else if (user.role === "paciente") {
        setLocation("/patient");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-slate-100">{APP_TITLE}</h1>
            </div>
            <Button asChild>
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-100 mb-6">
              Sistema Omnichannel para Clínicas Médicas
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Unifique todos os canais de atendimento em uma única plataforma. 
              Atenda seus pacientes com eficiência através de WhatsApp, Instagram, 
              Facebook, E-mail e Chat integrados.
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <a href={getLoginUrl()}>Começar Agora</a>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-slate-700 bg-slate-800/50 hover:border-cyan-500 transition-colors">
              <CardHeader>
                <MessageSquare className="w-12 h-12 text-cyan-400 mb-4" />
                <CardTitle>Para Pacientes</CardTitle>
                <CardDescription>
                  Escolha seu canal preferido de comunicação e mantenha todo o histórico 
                  de conversas em um só lugar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✓ Múltiplos canais de contato</li>
                  <li>✓ Histórico completo</li>
                  <li>✓ Confirmações automáticas</li>
                  <li>✓ Lembretes de consultas</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-700 bg-slate-800/50 hover:border-cyan-500 transition-colors">
              <CardHeader>
                <Users className="w-12 h-12 text-emerald-400 mb-4" />
                <CardTitle>Para Atendentes</CardTitle>
                <CardDescription>
                  Caixa de entrada unificada com todas as mensagens dos pacientes, 
                  independente do canal de origem.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✓ Inbox unificado</li>
                  <li>✓ Respostas rápidas</li>
                  <li>✓ Histórico completo</li>
                  <li>✓ Integração com agenda</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-700 bg-slate-800/50 hover:border-cyan-500 transition-colors">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-indigo-400 mb-4" />
                <CardTitle>Para Gerentes</CardTitle>
                <CardDescription>
                  Dashboard completo com métricas de desempenho, gestão de filas 
                  e supervisão em tempo real.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✓ Métricas em tempo real</li>
                  <li>✓ Gestão de atendentes</li>
                  <li>✓ Relatórios detalhados</li>
                  <li>✓ Supervisão de filas</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-slate-700 to-slate-600 text-white border-0">
              <CardHeader>
                <CardTitle className="text-3xl text-white">Pronto para começar?</CardTitle>
                <CardDescription className="text-slate-200 text-lg">
                  Faça login agora e experimente a eficiência do atendimento omnichannel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
                  <a href={getLoginUrl()}>Acessar Sistema</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-700 mt-20 py-8 bg-slate-900">
          <div className="container mx-auto px-4 text-center text-slate-400">
            <p>© 2024 {APP_TITLE}. Sistema de atendimento omnichannel para clínicas médicas.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}
