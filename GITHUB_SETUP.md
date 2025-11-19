# Guia: Como Salvar o Sistema no GitHub

Este guia passo a passo mostra como fazer upload do seu projeto para o GitHub para fins de trabalho acadêmico.

## 📋 Pré-requisitos

1. **Conta GitHub** - Crie uma em https://github.com (gratuito)
2. **Git instalado** - Download em https://git-scm.com
3. **Projeto pronto** - Seu sistema omnichannel completo

## 🔧 Configuração Inicial do Git

Se é a primeira vez usando Git, configure suas informações:

```bash
git config --global user.name "Seu Nome Completo"
git config --global user.email "seu.email@example.com"
```

## 📝 Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Preencha os dados:
   - **Repository name**: `clinica-omnichannel` (ou outro nome)
   - **Description**: "Sistema Omnichannel para Clínica Médica - Trabalho ADS"
   - **Public** ou **Private**: Escolha conforme sua instituição exigir
   - **Initialize with README**: Deixe desmarcado (já temos um)
3. Clique em **Create repository**
4. Copie a URL do repositório (algo como: `https://github.com/seu-usuario/clinica-omnichannel.git`)

## 💻 Passo 2: Inicializar Git Localmente

Abra o terminal/prompt na pasta do projeto e execute:

```bash
# Entrar na pasta do projeto
cd clinica-omnichannel

# Inicializar repositório Git
git init

# Adicionar o repositório remoto
git remote add origin https://github.com/seu-usuario/clinica-omnichannel.git

# Renomear branch para main (padrão do GitHub)
git branch -M main
```

## 📤 Passo 3: Adicionar e Fazer Commit dos Arquivos

```bash
# Adicionar todos os arquivos
git add .

# Criar commit inicial
git commit -m "Commit inicial: Sistema Omnichannel para Clínica Médica

- Schema de banco de dados com 7 tabelas
- Painéis para paciente, atendente e gerente
- Autenticação com Manus OAuth
- Testes unitários completos
- Documentação técnica
- Tema escuro e frio"
```

## 🚀 Passo 4: Fazer Upload para GitHub

```bash
# Enviar para o repositório remoto
git push -u origin main
```

Se pedirá suas credenciais do GitHub:
- **Username**: Seu usuário GitHub
- **Password**: Seu token de acesso pessoal (PAT)

### Gerar Token de Acesso Pessoal (se necessário)

1. Acesse https://github.com/settings/tokens
2. Clique em **Generate new token**
3. Selecione escopos: `repo` (acesso completo a repositórios)
4. Clique em **Generate token**
5. Copie o token e use como senha

## ✅ Passo 5: Verificar Upload

1. Acesse seu repositório no GitHub
2. Verifique se todos os arquivos estão lá
3. Confirme que o README.md está visível

## 📚 Passo 6: Adicionar Documentação Importante

Certifique-se de que os seguintes arquivos estão no repositório:

- ✅ `README.md` - Descrição do projeto
- ✅ `DOCUMENTACAO.md` - Documentação técnica
- ✅ `GITHUB_SETUP.md` - Este guia
- ✅ `todo.md` - Lista de funcionalidades
- ✅ `.gitignore` - Arquivos ignorados
- ✅ `package.json` - Dependências

## 🔄 Passo 7: Atualizações Futuras

Quando fizer mudanças no projeto:

```bash
# Ver status das mudanças
git status

# Adicionar mudanças
git add .

# Criar commit com mensagem descritiva
git commit -m "Descrição das mudanças realizadas"

# Enviar para GitHub
git push
```

## 📋 Exemplo de Mensagens de Commit Boas

```bash
# Adicionar nova funcionalidade
git commit -m "Feat: Adicionar sistema de notificações"

# Corrigir bug
git commit -m "Fix: Corrigir erro de validação de email"

# Atualizar documentação
git commit -m "Docs: Atualizar instruções de instalação"

# Melhorar código
git commit -m "Refactor: Simplificar lógica de autenticação"
```

## 🎓 Dicas para Trabalho Acadêmico

1. **Commit frequente**: Faça commits pequenos e bem descritos
2. **Branches**: Use branches para features diferentes
3. **README claro**: Explique bem o projeto no README
4. **Documentação**: Mantenha documentação atualizada
5. **Histórico limpo**: Evite commits com "fix typo" repetidos

## 🐛 Solução de Problemas

### Erro: "fatal: not a git repository"
```bash
# Certifique-se de estar na pasta correta
cd clinica-omnichannel
git init
```

### Erro: "Permission denied (publickey)"
- Gere uma chave SSH: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- Ou use HTTPS com token de acesso pessoal

### Erro: "fatal: 'origin' does not appear to be a 'git' repository"
```bash
# Adicione o repositório remoto
git remote add origin https://github.com/seu-usuario/clinica-omnichannel.git
```

### Desejo remover arquivo que foi enviado por engano
```bash
# Remover do Git (mas manter localmente)
git rm --cached nome-do-arquivo
git commit -m "Remove arquivo desnecessário"
git push
```

## 📖 Recursos Úteis

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com
- **GitHub Docs**: https://docs.github.com
- **Markdown Guide**: https://www.markdownguide.org

## ✨ Resultado Final

Após seguir estes passos, você terá:

✅ Repositório no GitHub
✅ Código versionado e documentado
✅ Histórico de commits
✅ Acesso remoto ao projeto
✅ Pronto para apresentar em aula

---

**Dúvidas?** Consulte a documentação do Git ou GitHub nos links acima.
