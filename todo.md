# TODO - Sistema Omnichannel Clínica Médica

## Infraestrutura e Banco de Dados
- [x] Criar schema de banco de dados para conversas/mensagens
- [x] Criar schema para canais de atendimento
- [x] Criar schema para filas de atendimento
- [x] Criar schema para métricas e relatórios
- [x] Implementar procedures tRPC para operações de dados

## Autenticação e Controle de Acesso
- [x] Configurar sistema de roles (paciente, atendente, gerente)
- [x] Implementar proteção de rotas por role
- [x] Criar página de login
- [x] Implementar navegação baseada em perfil

## Painel do Paciente
- [x] Interface para enviar mensagens
- [x] Visualizar histórico de conversas
- [x] Receber confirmações de agendamento
- [x] Sistema de notificações

## Painel do Atendente
- [x] Caixa de entrada unificada de mensagens
- [x] Visualizar histórico completo de conversas
- [x] Sistema de respostas rápidas
- [x] Registrar informações de atendimento
- [x] Integração com agenda médica (simulada)
- [x] Marcar conversas como resolvidas

## Painel do Gerente
- [x] Dashboard com métricas de desempenho
- [x] Visualizar fila de atendimentos
- [x] Distribuir atendimentos entre atendentes
- [x] Monitorar produtividade (tempo médio, número de atendimentos)
- [x] Visualizar conversas em tempo real
- [x] Redirecionar atendimentos
- [x] Relatórios consolidados
- [x] Indicadores de SLA e taxa de conversão

## Funcionalidades Omnichannel
- [x] Simular integração com WhatsApp
- [x] Simular integração com Facebook Messenger
- [x] Simular integração com Instagram Direct
- [x] Simular integração com E-mail
- [x] Chat do site (implementação real)

## Testes e Qualidade
- [x] Testes unitários para procedures principais
- [x] Testes de autenticação e autorização
- [x] Validação de fluxos de atendimento

## Documentação e Entrega
- [x] Criar checkpoint final
- [x] Documentar funcionalidades implementadas

## Melhorias de Design
- [x] Alterar esquema de cores para tons mais escuros e frios

## Bugs Corrigidos
- [x] Corrigir erro de navegação no PatientDashboard durante render
