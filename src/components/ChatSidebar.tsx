import { useMemo, useState, useRef, useEffect } from 'react'
import { Bot, MapPin, Send, Mic, MicOff } from 'lucide-react'
import type { ChatMessage, Poi } from '../types'
import { recommendPois } from '../lib/llmMock'
import { geminiDebugInfo, geminiDecideMode, geminiReply, isGeminiEnabled } from '../lib/gemini'
import { generateId, maskApiKey } from '../utils/stringUtils'

// Tipos para Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new (): SpeechRecognition
    }
  }
}

function getErrorTips(msg: string): string {
  if (msg.includes('HTTP 403')) {
    return '\n\nPossíveis causas: chave inválida ou restrição de key (referrer). No Google AI Studio, gere uma key sem restrição (ou adicione localhost).'
  }
  if (msg.includes('HTTP 429')) {
    return '\n\nPossível causa: limite/quotas. Tente novamente em alguns segundos ou troque a key.'
  }
  if (msg.includes('HTTP 400')) {
    return '\n\nPossível causa: modelo inválido. Use gemini-2.5-flash ou gemini-2.0-flash (ou ajuste `VITE_GEMINI_MODEL` / `VITE_LLM_MODEL`).'
  }
  return ''
}

type Props = {
  pois: Poi[]
  messages: ChatMessage[]
  onMessagesChange: (messages: ChatMessage[]) => void
  onSelectPoi: (poiId: string) => void
  onResults?: (query: string, results: Poi[]) => void
}

export function ChatSidebar({ pois, messages, onMessagesChange, onSelectPoi, onResults }: Props) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [lastGeminiError, setLastGeminiError] = useState<string | null>(null)
  const [showGeminiErrorDetails, setShowGeminiErrorDetails] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const canSend = text.trim().length > 0 && !isSending
  const geminiOn = isGeminiEnabled()
  const geminiInfo = useMemo(() => geminiDebugInfo(), [])

  // Verifica suporte para Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'pt-BR'
      
      recognition.onstart = () => {
        setIsListening(true)
      }
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript).trim())
        setIsListening(false)
      }
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Erro no reconhecimento de voz:', event.error)
        setIsListening(false)
        if (event.error === 'no-speech') {
          // Silenciosamente ignora quando não há fala
        }
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current = recognition
    }
  }, [])

  const headerHint = useMemo(
    () => ['mocotó', 'artesanato', 'peixe', 'comida', 'mercearia'].map((s) => `"${s}"`).join(', '),
    [],
  )

  function toggleListening() {
    if (!recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error('Erro ao iniciar gravação:', err)
        setIsListening(false)
      }
    }
  }

  async function send() {
    const raw = text.trim()
    if (!raw) return
    if (isSending) return

    const now = Date.now()
    const next: ChatMessage[] = [
      ...messages,
      { id: generateId('u'), role: 'user', text: raw, ts: now },
    ]
    onMessagesChange(next)
    setText('')
    setIsSending(true)

    // Sem Gemini: não existe "mock do chat" — apenas orienta a configurar.
    if (!geminiOn) {
      const assistantMsg: ChatMessage = {
        id: generateId('a'),
        role: 'assistant',
        ts: now + 1,
        text:
          `No momento eu preciso do **Gemini** para responder.\n\n` +
          `O app está lendo: VITE_LLM_MODE="${geminiInfo.modeRaw}", chave=${geminiInfo.keyVar ?? 'ausente'}, modelo="${geminiInfo.model}".\n\n` +
          `Configure o \`.env\` com \`VITE_LLM_MODE=gemini\` e sua chave (\`VITE_GEMINI_API_KEY\` ou \`VITE_LLM_API_KEY\`), reinicie o \`npm run dev\` e tente novamente.`,
      }
      onMessagesChange([...next, assistantMsg])
      setIsSending(false)
      return
    }

    try {
      const decision = await geminiDecideMode({ userText: raw, messages: next })
      const isSearch = decision.mode === 'search'
      const searchQuery = decision.searchQuery || raw
      const rec = isSearch ? recommendPois(searchQuery, pois).pois : ([] as Poi[])

      const assistantText = await geminiReply({
        userText: raw,
        messages: next,
        suggestions: rec,
        mode: isSearch ? 'search' : 'help',
      })
      setLastGeminiError(null)

      const assistantMsg: ChatMessage = {
        id: generateId('a'),
        role: 'assistant',
        text: assistantText,
        ts: now + 1,
      }

      const final = [...next, assistantMsg]
      onMessagesChange(final)
      setIsSending(false)

      // Só publica resultados quando o Gemini disse que é busca
      if (isSearch) onResults?.(searchQuery, rec)
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : String(err)
      // evita vazar tokens/chaves no UI
      const maskedMsg = maskApiKey(rawMsg)
      setLastGeminiError(maskedMsg)
      setShowGeminiErrorDetails(true)

      const errorTips = getErrorTips(maskedMsg)
      const assistantMsg: ChatMessage = {
        id: generateId('a'),
        role: 'assistant',
        ts: now + 1,
        text:
          'Desculpa — não consegui falar com o Gemini agora.\n\n' +
          `Motivo (resumo): ${maskedMsg}${errorTips}\n\n` +
          'Dica: clique no badge “Gemini (erro)” no topo para ver os detalhes.',
      }
      onMessagesChange([...next, assistantMsg])
      setIsSending(false)
      return
    }
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-institutional bg-primary-600 text-white shadow-sm">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">Guia do Mercado da Cidade</div>
          <div className="truncate text-xs text-gray-500">Exemplos: {headerHint}</div>
        </div>
        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={() => {
              if (!lastGeminiError) return
              setShowGeminiErrorDetails((v) => !v)
            }}
            className={[
              'inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold',
              geminiOn && !lastGeminiError
                ? 'bg-success-light text-success-dark ring-1 ring-success-500/20'
                : lastGeminiError
                  ? 'bg-warning-light text-warning-dark ring-1 ring-warning-500/20'
                  : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
            ].join(' ')}
            title={
              lastGeminiError
                ? `Gemini habilitado, mas falhou: ${lastGeminiError}`
                : geminiOn
                  ? `Gemini ativo (VITE_LLM_MODE=${geminiInfo.modeRaw}; chave=${geminiInfo.keyVar ?? 'ausente'}; modelo=${geminiInfo.model})`
                  : `Gemini não configurado (VITE_LLM_MODE=${geminiInfo.modeRaw}; chave=${geminiInfo.keyVar ?? 'ausente'})`
            }
          >
            {geminiOn ? (lastGeminiError ? 'Gemini (erro)' : 'Gemini') : 'Configurar Gemini'}
          </button>
        </div>
      </div>

      {lastGeminiError && showGeminiErrorDetails ? (
        <div className="border-b border-gray-200 bg-warning-light px-4 py-2 text-[11px] text-warning-dark">
          <div className="font-semibold">Erro do Gemini</div>
          <div className="mt-1 whitespace-pre-wrap break-words">{lastGeminiError}</div>
        </div>
      ) : null}

      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user'
            return (
              <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-card px-4 py-3 text-sm leading-relaxed ${
                    isUser 
                      ? 'bg-blue-700 text-white shadow-xl font-bold border-2 border-blue-800' 
                      : 'bg-gray-200 text-gray-900 border-2 border-gray-400 font-medium'
                  }`}
                >
                  <div className={`whitespace-pre-wrap ${isUser ? 'text-white' : 'text-gray-900'}`}>{m.text}</div>

                  {!isUser && m.recommendations && m.recommendations.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {m.recommendations.map((r) => (
                        <button
                          key={r.poiId}
                          onClick={() => onSelectPoi(r.poiId)}
                          className="flex w-full items-start gap-2 rounded-institutional border border-gray-200 bg-white px-3 py-2 text-left transition-colors hover:border-primary-300 hover:bg-primary-50"
                        >
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-900">{r.title}</div>
                            <div className="truncate text-xs text-gray-500">{r.subtitle}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
          
          {/* Indicador de digitação quando a IA está processando */}
          {isSending && geminiOn ? (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-card px-4 py-3 bg-gray-200 text-gray-900 border-2 border-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <span 
                      className="inline-block h-2.5 w-2.5 rounded-full bg-gray-600" 
                      style={{ 
                        animation: 'typing 1.4s infinite',
                        animationDelay: '0ms'
                      }} 
                    />
                    <span 
                      className="inline-block h-2.5 w-2.5 rounded-full bg-gray-600" 
                      style={{ 
                        animation: 'typing 1.4s infinite',
                        animationDelay: '200ms'
                      }} 
                    />
                    <span 
                      className="inline-block h-2.5 w-2.5 rounded-full bg-gray-600" 
                      style={{ 
                        animation: 'typing 1.4s infinite',
                        animationDelay: '400ms'
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2 rounded-institutional border-2 border-gray-300 bg-white px-3 py-2 shadow-institutional focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200">
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={isSending}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-institutional transition-all ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg border-2 border-red-700 animate-pulse'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isListening ? 'Parar gravação' : 'Iniciar gravação de voz'}
              title={isListening ? 'Parar gravação' : 'Falar (gravar voz)'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            placeholder={speechSupported ? "Pergunte por um produto ou setor… ou clique no microfone" : "Pergunte por um produto ou setor…"}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-500 focus:outline-none"
          />
          <button
            disabled={!canSend}
            onClick={() => void send()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-institutional bg-blue-700 text-white shadow-xl border-2 border-blue-800 transition-all hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {isListening && (
          <div className="mt-2 text-xs text-center text-gray-600 animate-pulse">
            🎤 Gravando... Fale agora
          </div>
        )}
      </div>
    </aside>
  )
}

