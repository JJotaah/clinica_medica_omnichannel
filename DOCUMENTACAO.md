# Sistema Omnichannel para Clínica Médica

## Visão Geral

O Sistema Omnichannel para Clínica Médica é uma plataforma completa que unifica múltiplos canais de atendimento em uma única interface, permitindo que pacientes escolham seu canal preferido de comunicação enquanto atendentes e gerentes gerenciam todas as interações de forma centralizada.

## Funcionalidades Principais

### Para Pacientes

O painel do paciente oferece uma experiência simplificada e intuitiva para comunicação com a clínica:

- **Múltiplos Canais de Contato**: Escolha entre WhatsApp, Instagram Direct, Facebook Messenger, E-mail ou Chat do Site
- **Histórico Completo**: Visualize todas as conversas anteriores em um único lugar
- **Criação de Conversas**: Inicie novas conversas selecionando o canal e descrevendo o assunto
- **Status em Tempo Real**: Acompanhe o status de cada atendimento (Aberta, Em Atendimento, Resolvida, Fechada)
- **Interface Responsiva**: Acesse de qualquer dispositivo com design adaptativo

### Para Atendentes

O painel do atendente centraliza todas as interações e fornece ferramentas para atendimento eficiente:

- **Caixa de Entrada Unificada**: Todas as mensagens de todos os canais em um único lugar
- **Visualização por Status**: Separe atendimentos ativos de resolvidos
- **Respostas Rápidas**: Acesse modelos de respostas pré-cadastradas para agilizar o atendimento
- **Histórico Completo**: Veja todo o histórico de conversas com cada paciente
- **Marcar como Resolvido**: Finalize atendimentos com um clique
- **Métricas Pessoais**: Visualize estatísticas de atendimentos ativos e resolvidos

### Para Gerentes

O painel do gerente oferece visão completa e controle sobre toda a operação de atendimento:

- **Dashboard de Métricas**: Visualize métricas em tempo real:
  - Total de conversas no sistema
  - Fila de espera (conversas não atribuídas)
  - Atendimentos em andamento
  - Número de atendentes ativos
  
- **Gestão de Filas**: 
  - Visualize conversas aguardando atribuição
  - Distribua atendimentos entre atendentes disponíveis
  - Redirecione conversas quando necessário

- **Supervisão em Tempo Real**:
  - Acesse qualquer conversa para supervisão
  - Monitore o desempenho de cada atendente
  - Intervenha em atendimentos críticos

- **Gerenciamento de Respostas Rápidas**:
  - Crie modelos de respostas para a equipe
  - Organize por categorias (agendamento, exames, informações)
  - Atualize conforme necessário

- **Gestão de Equipe**:
  - Visualize todos os atendentes cadastrados
  - Monitore último acesso de cada membro
  - Gerencie permissões e roles

## Arquitetura Técnica

### Stack Tecnológica

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Banco de Dados**: MySQL/TiDB com Drizzle ORM
- **Autenticação**: Manus OAuth integrado
- **Validação**: Zod para validação de schemas
- **Testes**: Vitest para testes unitários

### Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

1. **users**: Gerenciamento de usuários com roles (paciente, atendente, gerente, admin)
2. **channels**: Canais de atendimento disponíveis (WhatsApp, Instagram, Facebook, E-mail, Chat)
3. **conversations**: Conversas entre pacientes e atendentes
4. **messages**: Mensagens dentro de cada conversa
5. **quickReplies**: Modelos de respostas rápidas
6. **conversationNotes**: Notas e observações sobre atendimentos
7. **attendanceMetrics**: Métricas de desempenho por atendente

### Controle de Acesso

O sistema implementa controle de acesso baseado em roles:

- **Paciente**: Acesso ao próprio histórico e criação de conversas
- **Atendente**: Acesso a conversas atribuídas e respostas rápidas
- **Gerente**: Acesso completo a todas as conversas, métricas e gestão de equipe
- **Admin**: Permissões administrativas completas

### Procedures tRPC

O sistema expõe os seguintes routers via tRPC:

- **auth**: Autenticação e logout
- **channels**: Listagem de canais disponíveis
- **conversations**: Gerenciamento de conversas (criar, listar, atualizar status, atribuir)
- **messages**: Envio e listagem de mensagens
- **quickReplies**: Gerenciamento de respostas rápidas
- **notes**: Notas sobre conversas
- **metrics**: Métricas de atendimento
- **users**: Gerenciamento de usuários e atendentes

## Como Usar

### Primeiro Acesso

1. Acesse o sistema através da URL fornecida
2. Clique em "Entrar" ou "Acessar Sistema"
3. Faça login com suas credenciais Manus
4. Você será redirecionado automaticamente para o painel correspondente ao seu perfil

### Fluxo de Atendimento

#### Como Paciente:

1. Acesse o painel do paciente
2. Clique em "Nova Conversa"
3. Selecione o canal de atendimento preferido
4. Descreva o assunto da conversa
5. Envie mensagens e acompanhe as respostas
6. Visualize o histórico de todas as suas conversas

#### Como Atendente:

1. Acesse o painel do atendente
2. Visualize conversas atribuídas na aba "Ativos"
3. Clique em uma conversa para abrir
4. Utilize respostas rápidas quando apropriado
5. Envie mensagens para o paciente
6. Marque a conversa como "Resolvida" ao finalizar
7. Consulte conversas anteriores na aba "Resolvidos"

#### Como Gerente:

1. Acesse o painel do gerente
2. Visualize métricas gerais no dashboard
3. Na aba "Fila de Espera", atribua conversas a atendentes
4. Monitore atendimentos em andamento
5. Crie respostas rápidas para a equipe
6. Visualize e gerencie a equipe de atendentes
7. Acesse qualquer conversa para supervisão

## Testes

O sistema inclui testes unitários abrangentes que validam:

- Controle de acesso baseado em roles
- Procedures de conversas e mensagens
- Gerenciamento de respostas rápidas
- Listagem de atendentes e usuários

Execute os testes com:

```bash
pnpm test
```

## Configuração de Roles

Para alterar o role de um usuário:

1. Acesse o painel do gerente
2. Utilize a procedure `users.updateRole` via interface administrativa
3. Ou execute diretamente no banco de dados:

```sql
UPDATE users SET role = 'atendente' WHERE id = <user_id>;
```

Roles disponíveis: `paciente`, `atendente`, `gerente`, `admin`

## Canais Omnichannel

O sistema suporta os seguintes canais (pré-cadastrados):

1. **WhatsApp**: Simulação de integração com WhatsApp Business
2. **Instagram Direct**: Simulação de integração com Instagram
3. **Facebook Messenger**: Simulação de integração com Facebook
4. **E-mail**: Simulação de integração com e-mail
5. **Chat do Site**: Implementação real de chat integrado

## Próximos Passos

Para expandir o sistema, considere:

1. **Integração Real com APIs**: Conectar com APIs reais do WhatsApp, Instagram e Facebook
2. **Notificações Push**: Implementar notificações em tempo real
3. **Métricas Avançadas**: Adicionar relatórios de SLA, tempo médio de resposta, taxa de conversão
4. **Agendamento**: Integrar com sistema de agendamento de consultas
5. **Prontuário Eletrônico**: Conectar com sistema de prontuário
6. **Lembretes Automáticos**: Enviar lembretes via SMS, e-mail e WhatsApp
7. **Chat em Tempo Real**: Implementar WebSockets para atualizações em tempo real
8. **Exportação de Relatórios**: Gerar relatórios em PDF/Excel

## Suporte

Para questões técnicas ou suporte, consulte a documentação do código ou entre em contato com a equipe de desenvolvimento.
