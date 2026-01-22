# 🏪 Mercado da Cidade - Sistema de Mapa Interativo

Sistema web interativo desenvolvido para o **Mercado da Cidade de São Luís**, que abriga os feirantes do tradicional Mercado Central durante sua reforma. O projeto oferece um mapa interativo, busca inteligente de estabelecimentos, assistente virtual com IA e sistema de avaliações.

![Mercado da Cidade](https://img.shields.io/badge/Mercado%20da%20Cidade-São%20Luís-blue)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.18-38B2AC?logo=tailwind-css)

## 🎯 Sobre o Projeto

O **Mercado da Cidade** foi entregue em 2024 pelo prefeito Eduardo Braide, localizado na Avenida Vitorino Freire, Aterro do Bacanga, Centro. Este espaço moderno foi criado para abrigar os feirantes do tradicional Mercado Central (fundado em 1864) durante o período de reforma e modernização.

Este sistema foi desenvolvido como solução para o **Hackathon: O Mercado Central sob a ótica da Inovação**, promovido pela Prefeitura de São Luís - MA, com o objetivo de modernizar e digitalizar a experiência dos visitantes e feirantes do mercado.

### Objetivos do Projeto

- 🗺️ Facilitar a localização de estabelecimentos e produtos no mercado
- 🤖 Oferecer assistência inteligente aos visitantes
- ⭐ Coletar feedback e avaliações dos estabelecimentos
- 📱 Proporcionar uma experiência digital moderna e acessível
- 🎨 Preservar a identidade cultural e histórica do Mercado Central

## ✨ Funcionalidades

### 🗺️ Mapa Interativo
- Visualização do layout interno do mercado
- Marcadores por setor (Açougue, Mercearia, Artesanato, Pescados, etc.)
- Sistema de rotas entre pontos de acesso e estabelecimentos
- Zoom e navegação intuitiva
- Interface adaptada para diferentes dispositivos

### 🔍 Busca Inteligente
- Busca por produtos (ex: "mocotó", "peixe", "artesanato", "frutas")
- Busca por setores do mercado
- Resultados em tempo real com filtros
- Integração direta com o mapa para visualização
- Sugestões automáticas durante a digitação

### 🤖 Assistente Virtual com IA
- Chat interativo utilizando Google Gemini API
- Classificação automática de intenções (busca vs. conversa/ajuda)
- Respostas contextuais sobre o mercado
- Informações sobre cultura e história de São Luís
- Modo mock disponível para desenvolvimento sem API

### ⭐ Sistema de Avaliações
- Questionário rápido e intuitivo
- Avaliação por estrelas (1 a 5)
- Avaliação de atendimento, produto e preço
- Interface otimizada para totem de atendimento
- Coleta de feedback estruturado

### 📱 Design Responsivo
- **Mobile:** Bottom sheets e navegação touch-friendly
- **Tablet:** Drawers colapsáveis e layout adaptativo
- **Desktop:** Sidebars fixas e layout amplo
- Design system baseado na identidade visual da Prefeitura de São Luís

## 🛠️ Stack Tecnológica

### Frontend Core
- **React 19.2.0** - Biblioteca UI moderna e performática
- **TypeScript 5.9.3** - Tipagem estática para maior segurança de código
- **Vite 7.2.4** - Build tool rápido e otimizado
- **React Router 7.12.0** - Roteamento client-side

### Estilização
- **Tailwind CSS 4.1.18** - Framework CSS utility-first
- **Autoprefixer** - Compatibilidade cross-browser
- **PostCSS** - Processamento de CSS

### Mapas e Geolocalização
- **Leaflet 1.9.4** - Biblioteca open-source para mapas interativos
- **React Leaflet 5.0.0** - Integração React/Leaflet

### Inteligência Artificial
- **Google Gemini API** - Assistente virtual com processamento de linguagem natural
- Sistema de fallback com mock para desenvolvimento

### UI/UX
- **Lucide React** - Biblioteca de ícones moderna e consistente
- Design system customizado baseado nas cores institucionais

### Ferramentas de Desenvolvimento
- **ESLint** - Linting e qualidade de código
- **TypeScript ESLint** - Regras específicas para TypeScript
- **React Hooks ESLint Plugin** - Validação de hooks do React

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** 18+ (recomendado: versão LTS)
- **npm**, **yarn** ou **pnpm** (gerenciador de pacotes)
- Conta no Google AI Studio (opcional, apenas se quiser usar a API do Gemini)

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd Hackaton_Mercado
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
   # Crie um arquivo .env na raiz do projeto
   # Veja a seção de Configuração abaixo
   ```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Modo do LLM: 'mock' ou 'gemini'
# 'mock' = usa lógica local sem API (recomendado para desenvolvimento)
# 'gemini' = usa a API do Google Gemini (requer chave de API)
VITE_LLM_MODE=your-mode-here

# Chave da API do Google Gemini (opcional, apenas se VITE_LLM_MODE=gemini)
# Obtenha em: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=your-api-key-here

# Modelo do Gemini (opcional)
VITE_GEMINI_MODEL=your-model-here

# System prompt customizado (opcional)
# Se vazio, o app usa o prompt padrão do arquivo src/lib/marketSystemPrompt.ts
VITE_LLM_SYSTEM_PROMPT=
```

### Como obter a chave da API Gemini (opcional)

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave e cole no `.env` como `VITE_GEMINI_API_KEY`

**⚠️ Importante:** 
- Nunca commite o arquivo `.env` no Git
- O arquivo `.env` já está no `.gitignore`
- Para desenvolvimento, você pode usar o modo mock (sem precisar de chave de API)

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

Visualiza o build de produção localmente antes de fazer deploy

### Lint

```bash
npm run lint
```

Verifica problemas de código e sugere correções

## 📁 Estrutura do Projeto

```
Hackaton_Mercado/
├── src/
│   ├── assets/              # Imagens e recursos estáticos
│   ├── components/          # Componentes React reutilizáveis
│   │   ├── ChatSidebar.tsx  # Chat com IA
│   │   ├── MarketMap.tsx    # Mapa interativo
│   │   ├── PoiDetailsPanel.tsx # Painel de detalhes
│   │   └── ...
│   ├── data/                # Dados mockados
│   │   ├── mockPois.ts      # Pontos de interesse
│   │   ├── pois.ts          # Dados dos estabelecimentos
│   │   └── sectors.ts       # Setores do mercado
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── gemini.ts        # Integração com Gemini API
│   │   ├── llmMock.ts       # Mock do LLM para desenvolvimento
│   │   ├── marketSystemPrompt.ts # Prompt do sistema
│   │   └── routeGraph.ts    # Lógica de rotas no mapa
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
├── package.json            # Dependências e scripts
├── tailwind.config.js      # Configuração do Tailwind
├── tsconfig.json           # Configuração do TypeScript
├── vite.config.ts          # Configuração do Vite
└── README.md              # Este arquivo
```

## 🎨 Design System

O projeto utiliza um design system baseado na identidade visual da **Prefeitura de São Luís - MA**:

- **Cores Primárias:** Azul institucional (#0066CC)
- **Cores Secundárias:** Verde institucional (#00A859)
- **Accent:** Amarelo/dourado (#FFB800)
- **Tipografia:** Inter (sans-serif)
- **Componentes:** Cards, botões, inputs padronizados seguindo o design system

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento com hot-reload |
| `npm run build` | Gera build de produção otimizado |
| `npm run preview` | Preview do build de produção localmente |
| `npm run lint` | Executa o linter para verificar qualidade do código |

## 🏆 Hackathon

Este projeto foi desenvolvido para o **Hackathon: O Mercado Central sob a ótica da Inovação**, promovido pela Prefeitura de São Luís - MA, através da Secretaria Municipal de Inovação, Sustentabilidade e Projetos Especiais.

### Desafio

Criar soluções inovadoras que modernizem a experiência dos visitantes e feirantes do Mercado da Cidade, preservando a identidade cultural e histórica do tradicional Mercado Central de São Luís.

### Solução Proposta

Sistema web interativo que combina:
- Tecnologias modernas (React, TypeScript, IA)
- Design responsivo e acessível
- Integração com mapas para navegação interna
- Assistente virtual para orientação aos visitantes
- Sistema de avaliações para feedback contínuo

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
- Comunidade de desenvolvedores que contribuíram com este projeto

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma [issue](../../issues) no repositório
- Entre em contato com a equipe de desenvolvimento

---

**Mercado da Cidade de São Luís**  
*Por uma cidade melhor* 🏙️
