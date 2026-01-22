# 🏪 Mercado da Cidade - Sistema de Mapa Interativo

Sistema web interativo desenvolvido para o **Mercado da Cidade de São Luís**, que abriga os feirantes do tradicional Mercado Central durante sua reforma. O projeto oferece um mapa interativo, busca inteligente de estabelecimentos, assistente virtual com IA (Gemini) e sistema de avaliações.

![Mercado da Cidade](https://img.shields.io/badge/Mercado%20da%20Cidade-São%20Luís-blue)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O **Mercado da Cidade** foi entregue em 2024 pelo prefeito Eduardo Braide, localizado na Avenida Vitorino Freire, Aterro do Bacanga, Centro. Este espaço moderno foi criado para abrigar os feirantes do tradicional Mercado Central (fundado em 1864) durante o período de reforma e modernização.

Este sistema oferece:
- 🗺️ **Mapa interativo** com localização de estabelecimentos
- 🔍 **Busca inteligente** por produtos e setores
- 🤖 **Assistente virtual** com IA (Google Gemini)
- ⭐ **Sistema de avaliações** para estabelecimentos
- 📱 **Design responsivo** para mobile, tablet e desktop

## ✨ Funcionalidades

### 🗺️ Mapa Interativo
- Visualização do layout do mercado
- Marcadores por setor (Açougue, Mercearia, Artesanato, etc.)
- Rotas entre pontos de acesso e estabelecimentos
- Zoom e navegação intuitiva

### 🔍 Busca Inteligente
- Busca por produtos (ex: "mocotó", "peixe", "artesanato")
- Busca por setores
- Resultados em tempo real
- Integração com mapa para visualização

### 🤖 Assistente Virtual (IA)
- Chat interativo com Google Gemini
- Classificação automática de intenções (busca vs. ajuda)
- Respostas contextuais sobre o mercado
- Informações sobre cultura e história de São Luís

### ⭐ Sistema de Avaliações
- Questionário rápido e intuitivo
- Avaliação por estrelas
- Avaliação de atendimento, produto e preço
- Interface otimizada para totem

### 📱 Design Responsivo
- **Mobile:** Bottom sheets e navegação touch-friendly
- **Tablet:** Drawers colapsáveis
- **Desktop:** Sidebars fixas e layout amplo

## 🛠️ Tecnologias

### Frontend
- **React 19.2.0** - Biblioteca UI
- **TypeScript 5.9.3** - Tipagem estática
- **Vite 7.2.4** - Build tool e dev server
- **Tailwind CSS 4.1.18** - Framework CSS
- **React Router 7.12.0** - Roteamento

### Mapas
- **Leaflet 1.9.4** - Biblioteca de mapas
- **React Leaflet 5.0.0** - Integração React/Leaflet

### IA
- **Google Gemini API** - Assistente virtual

### Ícones
- **Lucide React** - Biblioteca de ícones

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:
- **Node.js** 18+ (recomendado: LTS)
- **npm** ou **yarn** ou **pnpm**
- Conta no Google AI Studio (para chave da API Gemini)

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd mercado-mvp
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```

4. **Edite o arquivo `.env`** com suas configurações (veja [Configuração](#configuração))

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Modo do LLM: 'gemini' ou 'mock'
VITE_LLM_MODE=gemini

# Chave da API do Google Gemini
VITE_GEMINI_API_KEY=sua_chave_aqui

# Modelo do Gemini (opcional, padrão: gemini-2.5-flash)
VITE_GEMINI_MODEL=gemini-2.5-flash

# System prompt customizado (opcional)
# VITE_LLM_SYSTEM_PROMPT=Seu prompt customizado aqui
```

### Como obter a chave da API Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave e cole no `.env`

**⚠️ Importante:** Nunca commite o arquivo `.env` no Git!

## 🏃 Como Executar

### Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`

### Preview do Build

```bash
npm run preview
```

Visualiza o build de produção localmente

### Lint

```bash
npm run lint
```

Verifica problemas de código

## 📁 Estrutura do Projeto

```
mercado-mvp/
├── src/
│   ├── assets/              # Imagens e recursos estáticos
│   ├── components/          # Componentes React
│   │   ├── ChatSidebar.tsx  # Chat com IA
│   │   ├── MarketMap.tsx    # Mapa interativo
│   │   ├── PoiDetailsPanel.tsx # Painel de detalhes
│   │   └── ...
│   ├── data/                # Dados mockados
│   │   ├── mockPois.ts      # Pontos de interesse
│   │   └── sectors.ts       # Setores do mercado
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── gemini.ts        # Integração com Gemini
│   │   ├── llmMock.ts       # Mock do LLM
│   │   └── routeGraph.ts    # Lógica de rotas
│   ├── pages/               # Páginas da aplicação
│   │   ├── HomePage.tsx     # Página inicial
│   │   ├── SearchPage.tsx   # Página de busca/mapa
│   │   └── ReviewsPage.tsx  # Página de avaliações
│   ├── types/               # Definições TypeScript
│   │   ├── questionnaire.ts # Tipos do questionário
│   │   └── ...
│   ├── utils/               # Funções utilitárias
│   │   ├── constants.ts     # Constantes do projeto
│   │   ├── mapUtils.ts      # Utilitários do mapa
│   │   └── stringUtils.ts   # Utilitários de string
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── .env.example             # Exemplo de variáveis de ambiente
├── .gitignore              # Arquivos ignorados pelo Git
├── netlify.toml            # Configuração do Netlify
├── package.json            # Dependências e scripts
├── tailwind.config.js      # Configuração do Tailwind
├── tsconfig.json           # Configuração do TypeScript
├── vite.config.ts          # Configuração do Vite
└── README.md              # Este arquivo
```

## 🚀 Deploy

### Netlify (Recomendado)

O projeto já está configurado para deploy no Netlify. Veja o guia completo em [README-DEPLOY.md](./README-DEPLOY.md)

**Passos rápidos:**
1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente no painel
3. Deploy automático a cada push!

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte aplicações estáticas:
- **Vercel**
- **GitHub Pages**
- **AWS S3 + CloudFront**
- **Firebase Hosting**

## 🎨 Design System

O projeto utiliza um design system baseado na identidade visual da **Prefeitura de São Luís - MA**:

- **Cores Primárias:** Azul institucional (#0066CC)
- **Cores Secundárias:** Verde institucional (#00A859)
- **Accent:** Amarelo/dourado (#FFB800)
- **Tipografia:** Inter (sans-serif)
- **Componentes:** Cards, botões, inputs padronizados

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa o linter |

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para o **Hackathon: O Mercado Central sob a ótica da Inovação**.

© 2024 Prefeitura de São Luís - MA

## 👥 Autores

Desenvolvido para a Prefeitura de São Luís - MA

## 🙏 Agradecimentos

- Prefeitura de São Luís - MA
- Secretaria Municipal de Inovação, Sustentabilidade e Projetos Especiais
- Todos os feirantes do Mercado da Cidade

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma [issue](../../issues) no repositório
- Entre em contato com a equipe de desenvolvimento

---

**Mercado da Cidade de São Luís**  
*Por uma cidade melhor* 🏙️
