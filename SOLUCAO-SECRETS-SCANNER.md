# 🔒 Solução: Erro do Secrets Scanner do Netlify

Este guia explica como resolver o erro de **"build blocked by Netlify's secrets scanner"**.

## 📋 Passo a Passo

### 1. Verificar se há arquivos `.env` commitados no Git

Execute estes comandos no terminal (na raiz do projeto):

```bash
# Verificar se há arquivos .env sendo rastreados pelo Git
git ls-files | findstr /i "\.env"

# Se encontrar arquivos, verificar o histórico
git log --all --full-history -- .env
```

**Se encontrar arquivos `.env` commitados:**

```bash
# Parar de rastrear o arquivo (mas mantê-lo localmente)
git rm --cached .env

# Garantir que está no .gitignore (já está, mas vamos verificar)
echo .env >> .gitignore
echo .env.* >> .gitignore

# Commitar a remoção
git add .gitignore
git commit -m "Remove .env from Git tracking"
git push
```

**⚠️ IMPORTANTE:** Se você commitou um arquivo `.env` com uma chave real, você DEVE:
1. **Revogar/regenerar** a chave no Google AI Studio
2. **Criar uma nova chave** e usar apenas no Netlify (não commitar)

### 2. Configurar o Scanner de Segredos no Netlify

O Netlify está detectando falsos positivos nos arquivos de documentação. Para resolver:

#### Opção A: Desabilitar detecção de valores específicos (Recomendado)

1. Acesse o painel do Netlify: **Site settings** → **Environment variables**
2. Adicione uma nova variável de ambiente:
   - **Key:** `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES`
   - **Value:** `your-api-key-here,sua_chave_aqui`
   - **Scopes:** All scopes
   - **Deploy contexts:** All deploy contexts
   - **Secret:** ❌ Não marque (não é um segredo)

Isso diz ao Netlify para ignorar esses valores específicos que são apenas placeholders.

#### Opção B: Desabilitar detecção inteligente (se Opção A não funcionar)

1. No painel do Netlify: **Site settings** → **Environment variables**
2. Adicione:
   - **Key:** `SECRETS_SCAN_SMART_DETECTION_ENABLED`
   - **Value:** `false`
   - **Scopes:** All scopes
   - **Deploy contexts:** All deploy contexts

⚠️ **Use esta opção apenas se tiver certeza de que não há segredos reais no código.**

### 3. Adicionar Variáveis de Ambiente no Netlify

Agora adicione as variáveis de ambiente reais do seu projeto:

1. **Site settings** → **Environment variables** → **Import environment variables**
2. Cole o conteúdo do seu `.env` (com a chave real preenchida):

```
VITE_LLM_MODE=gemini
VITE_GEMINI_API_KEY=SUA_CHAVE_REAL_AQUI
VITE_GEMINI_MODEL=gemini-1.5-flash
VITE_LLM_SYSTEM_PROMPT=
```

3. **Marque:** ✅ "Contains secret values" (para proteger a chave)
4. **Scopes:** All scopes
5. **Deploy contexts:** All deploy contexts

### 4. Fazer Commit das Alterações

As alterações nos READMEs (substituindo `sua_chave_aqui` por `your-api-key-here`) já foram feitas para reduzir falsos positivos.

```bash
git add README.md README-DEPLOY.md
git commit -m "Atualizar placeholders nos READMEs para evitar falsos positivos do scanner"
git push
```

### 5. Re-executar o Build

Após configurar as variáveis de ambiente no Netlify, o build deve funcionar. Se ainda houver problemas:

1. Verifique os logs do build no Netlify
2. Confirme que todas as variáveis de ambiente foram adicionadas corretamente
3. Verifique se não há outros arquivos com chaves secretas commitadas

## 🔍 Verificação Adicional

Para verificar se há outras chaves secretas no código:

```bash
# Buscar por padrões comuns de chaves
git grep -n "AIza[0-9A-Za-z_-]\{20,\}" || echo "Nenhuma chave Gemini encontrada"
git grep -n "sk_live" || echo "Nenhuma chave Stripe encontrada"
git grep -n "BEGIN PRIVATE KEY" || echo "Nenhuma chave privada encontrada"
```

## ✅ Checklist Final

- [ ] Verificado se há `.env` commitado no Git
- [ ] Removido `.env` do Git (se encontrado)
- [ ] Regenerado a chave da API (se foi commitada)
- [ ] Configurado `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES` no Netlify
- [ ] Adicionado variáveis de ambiente no Netlify (com chave real)
- [ ] Commitado alterações nos READMEs
- [ ] Build executado com sucesso

## 📚 Referências

- [Netlify Secrets Scanner Docs](https://docs.netlify.com/manage/security/secret-scanning/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
