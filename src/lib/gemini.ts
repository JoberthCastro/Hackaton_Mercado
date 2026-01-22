import type { ChatMessage, Poi } from '../types'
import { SECTORS } from '../data/sectors'
import { marketSystemPrompt } from './marketSystemPrompt'
import { GEMINI } from '../utils/constants'

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
  // Prioriza modelos Flash (mais rápidos) para reduzir latência
  const knownModels = [preferredModelId, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest']
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
  // Pula mensagens de recomendação para reduzir contexto
  const tail = messages.slice(-maxTurns).filter(m => !m.text.includes('recomendação') && !m.text.includes('sugestão'))
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
      // Prompt simplificado e direto para resposta mais rápida
      const userPrompt = [
        'Classifique: "help" (conversa) ou "search" (busca produto/setor).',
        'Responda SOMENTE JSON: {"mode":"help"|"search","searchQuery":string}',
        'Se "help": searchQuery="". Se "search": normalize curto (ex: "mocotó", "peixe").',
        `Mensagem: "${opts.userText}"`,
  ].join('\n')

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [...toGeminiHistory(opts.messages, GEMINI.MAX_HISTORY_TURNS_DECIDE), { role: 'user' as const, parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: GEMINI.TEMPERATURE_DECIDE,
      topP: 1,
      maxOutputTokens: GEMINI.MAX_OUTPUT_TOKENS_DECIDE,
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

  // Prompt ultra-simplificado para resposta mais rápida - foco em clareza
  const userPrompt = [
    `Pergunta: "${opts.userText}"`,
    `Sugestões: ${suggestionLines || 'Nenhuma'}`,
    opts.mode === 'help'
      ? 'Responda PT-BR, 1-2 frases. Seja direto. Se pedir história, responda curto.'
      : 'Responda PT-BR, 1 frase. Diga o setor. Se lista vazia, pergunte o que procura.',
  ].join('\n')

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [...toGeminiHistory(opts.messages, GEMINI.MAX_HISTORY_TURNS_REPLY), { role: 'user' as const, parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: GEMINI.TEMPERATURE_REPLY,
      topP: GEMINI.TOP_P_REPLY,
      maxOutputTokens: GEMINI.MAX_OUTPUT_TOKENS_REPLY,
    },
  }

  const res = await generateContentWithFallback({ apiKey, preferredModel: model, body })
  const json = res.json as any
  const text: string | undefined = json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('')?.trim()
  if (!text) throw new Error('Resposta vazia do Gemini')
  return text
}

