# Sistema Omnichannel para Clínica Médica

Um sistema web completo de atendimento omnichannel para clínicas médicas, desenvolvido como trabalho acadêmico de ADS (Análise e Desenvolvimento de Sistemas).

## 🎯 Objetivo

Criar uma plataforma centralizada que unifique múltiplos canais de atendimento (WhatsApp, Instagram, Facebook, E-mail, Chat) permitindo que pacientes se comuniquem através do canal preferido enquanto atendentes e gerentes gerenciam todas as interações em uma única interface.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19** - Framework JavaScript para interface de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS 4** - Framework de CSS utilitário
- **shadcn/ui** - Componentes de UI reutilizáveis
- **Wouter** - Roteamento leve para React

### Backend
- **Express 4** - Framework web Node.js
- **tRPC 11** - RPC type-safe para comunicação cliente-servidor
- **Node.js** - Runtime JavaScript

### Banco de Dados
- **MySQL/TiDB** - Banco de dados relacional
- **Drizzle ORM** - ORM type-safe para TypeScript

### Autenticação
- **Manus OAuth** - Sistema de autenticação integrado

### Testes
- **Vitest** - Framework de testes unitários

## 📋 Funcionalidades

### Painel do Paciente
- ✅ Criar conversas em múltiplos canais
- ✅ Visualizar histórico de conversas
- ✅ Enviar e receber mensagens
- ✅ Acompanhar status de atendimento

### Painel do Atendente
- ✅ Caixa de entrada unificada
- ✅ Visualizar conversas atribuídas
- ✅ Usar respostas rápidas
- ✅ Marcar conversas como resolvidas
- ✅ Registrar notas sobre atendimentos

### Painel do Gerente
- ✅ Dashboard com métricas em tempo real
- ✅ Gerenciar fila de atendimentos
- ✅ Atribuir conversas a atendentes
- ✅ Supervisionar atendimentos
- ✅ Criar respostas rápidas
- ✅ Gerenciar equipe de atendentes

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+ instalado
- npm ou pnpm como gerenciador de pacotes
- Git instalado

### Passos de Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/clinica-omnichannel.git
cd clinica-omnichannel
```

2. **Instale as dependências**
```bash
pnpm install
# ou
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env.local na raiz do projeto
# Adicione as variáveis necessárias (será fornecido pela plataforma Manus)
```

4. **Configure o banco de dados**
```bash
# Execute as migrações
pnpm db:push
```

5. **Popule dados iniciais (opcional)**
```bash
# Cria os canais de atendimento
node seed-db.mjs
```

6. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

O sistema estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
clinica-omnichannel/
├── client/                 # Código frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e configurações
│   │   ├── App.tsx        # Componente raiz
│   │   └── index.css      # Estilos globais
│   └── public/            # Arquivos estáticos
├── server/                # Código backend Express
│   ├── routers.ts         # Definição de procedures tRPC
│   ├── db.ts              # Funções de banco de dados
│   └── _core/             # Configuração interna
├── drizzle/               # Migrações e schema do banco
│   ├── schema.ts          # Definição das tabelas
│   └── migrations/        # Histórico de migrações
├── shared/                # Código compartilhado
├── DOCUMENTACAO.md        # Documentação detalhada
├── README.md              # Este arquivo
└── package.json           # Dependências do projeto
```

## 🗄️ Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema (pacientes, atendentes, gerentes)
- **channels** - Canais de atendimento (WhatsApp, Instagram, etc)
- **conversations** - Conversas entre pacientes e atendentes
- **messages** - Mensagens dentro de cada conversa
- **quickReplies** - Modelos de respostas rápidas
- **conversationNotes** - Notas sobre atendimentos
- **attendanceMetrics** - Métricas de desempenho

## 🔐 Controle de Acesso

O sistema utiliza roles para controlar permissões:

- **paciente** - Acesso ao próprio histórico e criação de conversas
- **atendente** - Acesso a conversas atribuídas e respostas rápidas
- **gerente** - Acesso completo e gestão de equipe
- **admin** - Permissões administrativas

## ✅ Testes

Execute os testes unitários:

```bash
pnpm test
```

Testes incluem:
- Validação de controle de acesso por role
- Procedures de conversas e mensagens
- Gerenciamento de respostas rápidas
- Listagem de usuários

## 📊 Arquitetura

### Fluxo de Dados

1. **Frontend (React)** → Envia requisições via tRPC
2. **Backend (Express/tRPC)** → Processa e valida dados
3. **Banco de Dados (MySQL)** → Persiste informações
4. **Response** → Retorna dados type-safe ao frontend

### Segurança

- Autenticação via OAuth (Manus)
- Validação de schemas com Zod
- Controle de acesso baseado em roles
- Proteção de procedures tRPC

## 🎓 Trabalho Acadêmico

Este projeto foi desenvolvido como trabalho acadêmico para a disciplina de ADS (Análise e Desenvolvimento de Sistemas), demonstrando:

- ✅ Compreensão de arquitetura web moderna
- ✅ Implementação de banco de dados relacional
- ✅ Desenvolvimento full-stack com TypeScript
- ✅ Padrões de design e boas práticas
- ✅ Testes unitários e qualidade de código
- ✅ Documentação técnica completa

## 📝 Licença

Este projeto é fornecido como trabalho acadêmico. Sinta-se livre para usar, modificar e distribuir conforme necessário para fins educacionais.

## 👥 Autor

[Seu Nome]
Aluno de ADS - [Instituição]
Data: Novembro 2024

## 📞 Suporte

Para dúvidas sobre o projeto, consulte:
- `DOCUMENTACAO.md` - Documentação técnica completa
- `todo.md` - Lista de funcionalidades implementadas
- Código comentado nos arquivos principais

## 🔄 Próximas Melhorias

- [ ] Integração real com APIs de WhatsApp, Instagram e Facebook
- [ ] Notificações em tempo real com WebSockets
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Integração com sistema de agendamento
- [ ] Integração com prontuário eletrônico
- [ ] Lembretes automáticos via SMS/WhatsApp

---

**Desenvolvido com ❤️ para fins educacionais**
