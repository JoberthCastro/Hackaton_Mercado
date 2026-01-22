# 🚀 Guia de Deploy no Netlify

Este guia explica como fazer deploy do projeto Mercado da Cidade no Netlify.

## 📋 Pré-requisitos

1. Conta no [Netlify](https://www.netlify.com/)
2. Projeto no GitHub, GitLab ou Bitbucket (recomendado)
3. Arquivo `.env` configurado localmente (para referência)

## 🔧 Método 1: Deploy via Interface do Netlify (Recomendado)

### Passo 1: Preparar o Repositório

1. Certifique-se de que seu projeto está em um repositório Git (GitHub, GitLab ou Bitbucket)
2. Verifique se o arquivo `.env` está no `.gitignore` (não deve ser commitado)

### Passo 2: Conectar ao Netlify

1. Acesse [app.netlify.com](https://app.netlify.com/)
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Escolha seu provedor Git (GitHub, GitLab ou Bitbucket)
4. Autorize o Netlify a acessar seus repositórios
5. Selecione o repositório do projeto

### Passo 3: Configurar Build Settings

O Netlify deve detectar automaticamente as configurações do `netlify.toml`, mas verifique:

- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Node version:** Use a versão mais recente (ou especifique no `.nvmrc` se necessário)

### Passo 4: Configurar Variáveis de Ambiente

1. No painel do Netlify, vá em **Site settings** → **Environment variables**
2. Adicione as seguintes variáveis (baseado no seu `.env`):

```
VITE_LLM_MODE=gemini
VITE_GEMINI_API_KEY=sua_chave_aqui
VITE_GEMINI_MODEL=gemini-2.5-flash
```

**⚠️ IMPORTANTE:** 
- Não commite o arquivo `.env` no Git
- Adicione as variáveis de ambiente diretamente no painel do Netlify
- Use `VITE_` como prefixo para que o Vite exponha essas variáveis no cliente

### Passo 5: Fazer Deploy

1. Clique em **"Deploy site"**
2. Aguarde o build completar
3. Seu site estará disponível em uma URL como: `https://seu-projeto.netlify.app`

## 🔧 Método 2: Deploy via Netlify CLI

### Passo 1: Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

### Passo 2: Fazer Login

```bash
netlify login
```

### Passo 3: Inicializar o Site

```bash
cd mercado-mvp
netlify init
```

Siga as instruções:
- Escolha "Create & configure a new site"
- Escolha seu time (se aplicável)
- Escolha um nome para o site ou deixe o padrão

### Passo 4: Configurar Variáveis de Ambiente

```bash
netlify env:set VITE_LLM_MODE gemini
netlify env:set VITE_GEMINI_API_KEY sua_chave_aqui
netlify env:set VITE_GEMINI_MODEL gemini-2.5-flash
```

### Passo 5: Fazer Deploy

```bash
netlify deploy --prod
```

## 🔧 Método 3: Deploy via Drag & Drop

1. Execute o build localmente:
   ```bash
   npm run build
   ```

2. Acesse [app.netlify.com](https://app.netlify.com/)
3. Arraste a pasta `dist` para a área de deploy
4. Configure as variáveis de ambiente no painel (Site settings → Environment variables)

## ⚙️ Configurações Adicionais

### Domínio Personalizado

1. No painel do Netlify, vá em **Domain settings**
2. Clique em **"Add custom domain"**
3. Siga as instruções para configurar DNS

### Deploy Automático

O Netlify faz deploy automático sempre que você faz push para a branch principal do seu repositório.

Para configurar branches específicas:
1. Vá em **Site settings** → **Build & deploy** → **Continuous Deployment**
2. Configure quais branches devem fazer deploy

### Variáveis de Ambiente por Branch

Você pode ter variáveis diferentes para produção e preview:
- **Production:** Variáveis usadas no deploy da branch principal
- **Deploy previews:** Variáveis usadas em PRs e branches

## 🐛 Troubleshooting

### Build Falha

1. Verifique os logs de build no Netlify
2. Certifique-se de que todas as dependências estão no `package.json`
3. Verifique se o Node.js version está compatível

### Variáveis de Ambiente Não Funcionam

1. Certifique-se de que as variáveis começam com `VITE_`
2. Reinicie o deploy após adicionar novas variáveis
3. Verifique se não há espaços extras nos valores

### Rotas do React Router Não Funcionam

O arquivo `netlify.toml` já está configurado com redirects para SPA. Se ainda houver problemas:
1. Verifique se o `netlify.toml` está na raiz do projeto
2. Certifique-se de que o redirect está configurado corretamente

## 📚 Recursos Úteis

- [Documentação do Netlify](https://docs.netlify.com/)
- [Netlify CLI Docs](https://cli.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)

## ✅ Checklist de Deploy

- [ ] Projeto está em um repositório Git
- [ ] `.env` está no `.gitignore`
- [ ] `netlify.toml` está na raiz do projeto
- [ ] Build local funciona (`npm run build`)
- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] Deploy concluído com sucesso
- [ ] Site está acessível e funcionando
