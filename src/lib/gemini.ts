import type { ChatMessage, Poi } from '../types'
import { SECTORS } from '../data/sectors'
import { marketSystemPrompt } from './marketSystemPrompt'

type GeminiRole = 'user' | 'model'

type GeminiPart = { text: string }
type GeminiContent = { role: GeminiRole; parts: GeminiPart[] }

type GeminiApiVersion = 'v1' | 'v1beta'

function getApiKey() {
  const apiKey =
    (((import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined) ||
      ((import.meta as any).env?.VITE_LLM_API_KEY as string | undefined))?.trim()
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY ausente (ou VITE_LLM_API_KEY para compat)')
  return apiKey
}

function getPreferredModel() {
  return (
    ((import.meta as any).env?.VITE_GEMINI_MODEL as string | undefined) ||
    ((import.meta as any).env?.VITE_LLM_MODEL as string | undefined) ||
    'gemini-2.5-flash' // Modelo mais recente e disponível
  ).trim()
}

function normalizeModelId(model: string) {
  // aceita tanto "gemini-..." quanto "models/gemini-..."
  return model.startsWith('models/') ? model.slice('models/'.length) : model
}

function buildGenerateContentUrl(version: GeminiApiVersion, modelId: string) {
  return `https://generativelanguage.googleapis.com/${version}/models/${encodeURIComponent(modelId)}:generateContent`
}

async function fetchJsonWithKey(url: string, apiKey: string, init?: RequestInit) {
  // Preferimos header pra não vazar chave em URL do console/network.
  // Se o backend rejeitar, fazemos fallback para querystring.
  const resp = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
      ...(init?.headers || {}),
    },
  })

  if (resp.ok) return { ok: true as const, resp, text: await resp.text().catch(() => '') }
  const text = await resp.text().catch(() => '')

  // fallback: algumas gateways só aceitam key no query param
  if (resp.status === 401 || resp.status === 403) {
    const withKey = url.includes('?') ? `${url}&key=${encodeURIComponent(apiKey)}` : `${url}?key=${encodeURIComponent(apiKey)}`
    const resp2 = await fetch(withKey, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    })
    if (resp2.ok) return { ok: true as const, resp: resp2, text: await resp2.text().catch(() => '') }
    return { ok: false as const, resp: resp2, text: await resp2.text().catch(() => '') }
  }

  return { ok: false as const, resp, text }
}

function parseGeminiError(text: string) {
  try {
    const j = JSON.parse(text)
    const code = j?.error?.code
    const status = j?.error?.status
    const message = j?.error?.message
    return { code, status, message, raw: text }
  } catch {
    return { code: undefined, status: undefined, message: undefined, raw: text }
  }
}


async function listAvailableModels(apiKey: string): Promise<string[]> {
  const version: GeminiApiVersion = 'v1beta'
  const url = `https://generativelanguage.googleapis.com/${version}/models`
  const res = await fetchJsonWithKey(url, apiKey, { method: 'GET' })
  if (!res.ok) return []
  try {
    const json = JSON.parse(res.text || '{}') as any
    const models = Array.isArray(json?.models) ? json.models : []
    return models
      .filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent') && typeof m.name === 'string')
      .map((m: any) => normalizeModelId(m.name))
  } catch {
    return []
  }
}

async function generateContentWithFallback(opts: {
  apiKey: string
  preferredModel: string
  body: any
}) {
  // Simplificado: usa apenas v1beta (versão estável) e tenta modelos conhecidos
  const version: GeminiApiVersion = 'v1beta'
  const preferredModelId = normalizeModelId(opts.preferredModel)
  
  // Lista de modelos para tentar (em ordem de preferência)
  // Apenas modelos que estão disponíveis na API (descobertos via ListModels)
  const knownModels = [preferredModelId, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-flash-latest', 'gemini-pro-latest']
  const uniqueModels = Array.from(new Set(knownModels))

  let lastErr: string | null = null
  for (const modelId of uniqueModels) {
    const url = buildGenerateContentUrl(version, modelId)
    const res = await fetchJsonWithKey(url, opts.apiKey, { method: 'POST', body: JSON.stringify(opts.body) })
    if (res.ok) {
      return { version, modelId, json: JSON.parse(res.text || '{}') as any }
    }
    const err = parseGeminiError(res.text)
    lastErr = `Gemini HTTP ${res.resp.status} (${version}/${modelId}): ${err.message || res.text || res.resp.statusText}`
    // Se não for 404, não tenta outros modelos (erro de formato/permissão)
    if (res.resp.status !== 404 && err.status !== 'NOT_FOUND') break
  }

  // Se todos os modelos conhecidos falharam com 404, tenta descobrir modelos disponíveis
  try {
    const available = await listAvailableModels(opts.apiKey)
    if (available.length > 0) {
      // Tenta o primeiro modelo disponível que não foi tentado ainda
      const toTry = available.find((m) => !uniqueModels.includes(m)) || available[0]
      if (toTry) {
        const url = buildGenerateContentUrl(version, toTry)
        const res = await fetchJsonWithKey(url, opts.apiKey, { method: 'POST', body: JSON.stringify(opts.body) })
        if (res.ok) {
          return { version, modelId: toTry, json: JSON.parse(res.text || '{}') as any }
        }
        const err = parseGeminiError(res.text)
        lastErr = `${lastErr}; Tentativa com modelo descoberto (${toTry}): HTTP ${res.resp.status}: ${err.message || res.text || res.resp.statusText}`
      }
    }
  } catch (e) {
    lastErr = `${lastErr}; ListModels falhou: ${e instanceof Error ? e.message : String(e)}`
  }

  throw new Error(lastErr || 'Falha desconhecida ao chamar o Gemini')
}

export function geminiDebugInfo() {
  // IMPORTANTE: em Vite, prefira acesso direto (import.meta.env.VITE_*)
  // para garantir que as variáveis sejam injetadas corretamente.
  const modeRaw = ((import.meta as any).env?.VITE_LLM_MODE ?? 'mock').trim()
  const mode = modeRaw.toLowerCase()

  const key1 = ((import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined)?.trim()
  const key2 = ((import.meta as any).env?.VITE_LLM_API_KEY as string | undefined)?.trim()
  const keyVar = key1 ? 'VITE_GEMINI_API_KEY' : key2 ? 'VITE_LLM_API_KEY' : null

  const modelFromGemini = ((import.meta as any).env?.VITE_GEMINI_MODEL as string | undefined)?.trim()
  const modelFromLlm = ((import.meta as any).env?.VITE_LLM_MODEL as string | undefined)?.trim()
  const modelRaw = (modelFromGemini || modelFromLlm || 'gemini-2.5-flash').trim()
  const modelVar = modelFromGemini ? 'VITE_GEMINI_MODEL' : modelFromLlm ? 'VITE_LLM_MODEL' : 'default'
  const model = modelRaw

  const enabled = mode === 'gemini' && !!keyVar

  return {
    enabled,
    mode,
    modeRaw,
    keyVar,
    modelVar,
    model,
  }
}

export function isGeminiEnabled() {
  return geminiDebugInfo().enabled
}

function getSystemPrompt() {
  const override = ((import.meta as any).env?.VITE_LLM_SYSTEM_PROMPT as string | undefined) ?? undefined
  return (override && override.trim().length > 0 ? override : marketSystemPrompt).trim()
}

function toGeminiHistory(messages: ChatMessage[], maxTurns: number): GeminiContent[] {
  // mantém as últimas mensagens (sem recommendations)
  const tail = messages.slice(-maxTurns)
  const res: GeminiContent[] = []
  for (const m of tail) {
    if (m.role === 'user') {
      res.push({ role: 'user', parts: [{ text: m.text }] })
    } else {
      res.push({ role: 'model', parts: [{ text: m.text }] })
    }
  }
  return res
}

function safeParseJsonObject(text: string): any | null {
  const t = text.trim()
  // tenta pegar o primeiro objeto JSON do texto (Gemini às vezes inclui texto extra)
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start < 0 || end < 0 || end <= start) return null
  const slice = t.slice(start, end + 1)
  try {
    return JSON.parse(slice)
  } catch {
    return null
  }
}

export async function geminiDecideMode(opts: { userText: string; messages: ChatMessage[] }) {
  const apiKey = getApiKey()
  const model = getPreferredModel()

  const system = getSystemPrompt()
      const userPrompt = [
        'Você é um classificador de intenção para um atendente do Mercado da Cidade (São Luís).',
    'Classifique a mensagem do usuário em:',
    '- "help": conversa/saudação/pergunta geral (história, cultura, horários, quem é você etc.)',
    '- "search": quando o usuário está procurando um produto/setor/estabelecimento no mercado.',
    '',
    'Responda SOMENTE com JSON válido, sem texto extra, no formato:',
    '{"mode":"help"|"search","searchQuery":string}',
    '',
    'Regras:',
    '- Se for "help", use searchQuery=""',
    '- Se for "search", normalize searchQuery para algo curto (ex: "mocotó", "peixe", "artesanato", "comida").',
    '',
    `Mensagem do usuário: "${opts.userText}"`,
  ].join('\n')

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [...toGeminiHistory(opts.messages, 6), { role: 'user' as const, parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0,
      topP: 1,
      maxOutputTokens: 120,
    },
  }

  const res = await generateContentWithFallback({ apiKey, preferredModel: model, body })
  const json = res.json as any
  const raw: string =
    json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('')?.trim() ?? ''
  const parsed = safeParseJsonObject(raw)
  const mode = parsed?.mode === 'search' ? 'search' : 'help'
  const searchQuery = typeof parsed?.searchQuery === 'string' ? parsed.searchQuery.trim() : ''
  return { mode, searchQuery }
}

export async function geminiReply(opts: {
  userText: string
  messages: ChatMessage[]
  suggestions: Poi[]
  /** 'help' = conversa/guia; 'search' = busca por produto/setor */
  mode: 'help' | 'search'
}) {
  const apiKey = getApiKey()
  const model = getPreferredModel()

  const system = getSystemPrompt()
  const suggestionLines =
    opts.suggestions.length === 0
      ? 'Nenhuma sugestão encontrada pelo app.'
      : opts.suggestions
          .map((p, idx) => {
            const sector = SECTORS[p.sectorId]?.label ?? p.sectorId
            const routeTag = p.hasRoute === false ? 'sugestão (sem rota)' : 'com rota'
            return `${idx + 1}. ${p.name} — ${sector} — ${routeTag}`
          })
          .join('\n')

  const userPrompt = [
    `Pergunta do usuário: "${opts.userText}"`,
    '',
    'Sugestões (use SOMENTE estas opções):',
    suggestionLines,
    '',
    opts.mode === 'help'
          ? [
              'Você é um atendente/guia do Mercado da Cidade de São Luís.',
          'Responda em PT-BR, com linguagem bem simples e amigável (1–4 frases).',
          'Se o usuário pedir história/cultura, responda direto (sem falar de coordenadas, setores ou rotas).',
          'Se fizer sentido, termine com 1 pergunta curta oferecendo 2–4 exemplos do que a pessoa pode buscar (ex: comida, peixe/marisco, frutas, produtos regionais, artesanato).',
        ].join('\n')
      : [
          'Responda em PT-BR, 1–3 frases, com linguagem bem simples e amigável, dizendo o setor e orientando o usuário a usar "Rotas" ou "Info" no resultado.',
          'Não invente locais fora da lista. Se a lista estiver vazia, faça 1 pergunta de clarificação curta.',
        ].join('\n'),
  ].join('\n')

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [...toGeminiHistory(opts.messages, 8), { role: 'user' as const, parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 800, // Aumentado para permitir respostas completas (cultura, história, etc.)
    },
  }

  const res = await generateContentWithFallback({ apiKey, preferredModel: model, body })
  const json = res.json as any
  const text: string | undefined = json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('')?.trim()
  if (!text) throw new Error('Resposta vazia do Gemini')
  return text
}

