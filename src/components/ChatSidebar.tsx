import { useMemo, useState, useRef, useEffect } from 'react'
import { Bot, MapPin, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
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
  /** Texto inicial (atalho) para preencher o chat */
  initialDraft?: string
  /** Se true, envia automaticamente o texto inicial */
  autoSendInitial?: boolean
}

export function ChatSidebar({ pois, messages, onMessagesChange, onSelectPoi, onResults, initialDraft, autoSendInitial = false }: Props) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [lastGeminiError, setLastGeminiError] = useState<string | null>(null)
  const [showGeminiErrorDetails, setShowGeminiErrorDetails] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [ttsSupported, setTtsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const scrollEndRef = useRef<HTMLDivElement | null>(null)
  const didApplyInitialRef = useRef(false)

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

    // Verifica suporte para Speech Synthesis (text-to-speech)
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis
      setTtsSupported(true)
      
      // Carrega as vozes disponíveis (pode demorar um pouco)
      // Chrome precisa que as vozes sejam carregadas primeiro
      const loadVoices = () => {
        const voices = synthesisRef.current?.getVoices()
        if (voices && voices.length > 0) {
          // Vozes carregadas
        }
      }
      
      // Tenta carregar vozes imediatamente
      loadVoices()
      
      // Alguns navegadores carregam vozes assincronamente
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = loadVoices
      }
    }
  }, [])

  // Removido: headerHint não é mais necessário - reduz complexidade visual

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

  // Função para limpar texto (remove markdown e formatação)
  function cleanTextForSpeech(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove negrito
      .replace(/\*(.*?)\*/g, '$1') // Remove itálico
      .replace(/`(.*?)`/g, '$1') // Remove código inline
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links markdown
      .replace(/\n{2,}/g, '. ') // Substitui quebras de linha duplas por ponto
      .replace(/\n/g, ' ') // Remove quebras de linha simples
      .replace(/\s{2,}/g, ' ') // Remove espaços múltiplos
      .replace(/\.{2,}/g, '.') // Remove pontos múltiplos
      .trim()
  }

  // Função para falar o texto
  function speakText(text: string) {
    if (!synthesisRef.current || !speechEnabled) return

    // Para qualquer fala anterior
    synthesisRef.current.cancel()

    const cleanText = cleanTextForSpeech(text)
    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'pt-BR'
    
    // Ajustes para voz mais rápida, natural e atrativa
    utterance.rate = 2.0 // Bem mais rápido e dinâmico (padrão: 1.0, range: 0.1-10)
    utterance.pitch = 2.0 // Tom mais alto e agradável (padrão: 1.0, range: 0-2)
    utterance.volume = 1.0 // Volume máximo
    
    // Tenta selecionar a melhor voz brasileira disponível
    const voices = synthesisRef.current.getVoices()
    
    // Prioridade: vozes femininas brasileiras > Google > outras brasileiras
    const brazilianVoice = 
      voices.find((voice) => 
        voice.lang.startsWith('pt-BR') && 
        (voice.name.toLowerCase().includes('feminina') || 
         voice.name.toLowerCase().includes('female') ||
         voice.name.toLowerCase().includes('google'))
      ) || 
      voices.find((voice) => 
        voice.lang.startsWith('pt-BR') && 
        voice.name.toLowerCase().includes('brazil')
      ) ||
      voices.find((voice) => voice.lang.startsWith('pt-BR'))
    
    if (brazilianVoice) {
      utterance.voice = brazilianVoice
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      utteranceRef.current = null
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      utteranceRef.current = null
    }

    utteranceRef.current = utterance
    synthesisRef.current.speak(utterance)
  }

  // Para a fala atual
  function stopSpeaking() {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
      utteranceRef.current = null
    }
  }

  // Toggle de áudio
  function toggleSpeech() {
    if (isSpeaking) {
      stopSpeaking()
    }
    setSpeechEnabled((prev) => !prev)
  }

  // Fala automaticamente quando uma nova mensagem do assistente chega
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant' && speechEnabled && !isSending && ttsSupported) {
      // Pequeno delay para garantir que a mensagem foi renderizada
      const timer = setTimeout(() => {
        if (synthesisRef.current) {
          speakText(lastMessage.text)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, speechEnabled, isSending, ttsSupported])

  // Limpa a fala quando o componente desmonta
  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  // Mantém o scroll sempre no final para mostrar a resposta mais recente
  useEffect(() => {
    // 2 frames para garantir layout/altura final
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollEndRef.current) {
          scrollEndRef.current.scrollIntoView({ block: 'end' })
        } else if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      })
    })
  }, [messages.length, isSending])

  async function sendRaw(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return
    if (isSending) return

    const now = Date.now()
    const next: ChatMessage[] = [
      ...messages,
      { id: generateId('u'), role: 'user', text: trimmed, ts: now },
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
      const decision = await geminiDecideMode({ userText: trimmed, messages: next })
      const isSearch = decision.mode === 'search'
      const searchQuery = decision.searchQuery || trimmed
      const rec = isSearch ? recommendPois(searchQuery, pois).pois : ([] as Poi[])

      const assistantText = await geminiReply({
        userText: trimmed,
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

  async function send() {
    return await sendRaw(text)
  }

  // Atalho vindo da Home: preenche e (opcionalmente) envia automaticamente
  useEffect(() => {
    const draft = (initialDraft ?? '').trim()
    if (!draft) return
    if (didApplyInitialRef.current) return
    if (isSending) return
    didApplyInitialRef.current = true

    if (autoSendInitial) {
      void sendRaw(draft)
      return
    }

    setText(draft)
    // foca no textarea
    requestAnimationFrame(() => {
      const textarea = document.querySelector('textarea[placeholder*="Pergunte"]') as HTMLTextAreaElement | null
      textarea?.focus()
      if (textarea) textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    })
  }, [initialDraft, autoSendInitial, isSending])

  return (
    <aside className="flex h-full w-full flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-institutional bg-primary-600 text-white shadow-sm">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">Guia do Mercado</div>
          {/* Removido: exemplos reduzem complexidade inicial - usuário descobre naturalmente */}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Botão de áudio (text-to-speech) */}
          {ttsSupported && (
            <button
              type="button"
              onClick={toggleSpeech}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                speechEnabled
                  ? isSpeaking
                    ? 'bg-primary-600 text-white animate-pulse'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={speechEnabled ? (isSpeaking ? 'Falando...' : 'Desativar áudio') : 'Ativar áudio'}
              aria-label={speechEnabled ? 'Desativar áudio' : 'Ativar áudio'}
            >
              {isSpeaking ? (
                <Volume2 className="h-4 w-4" />
              ) : speechEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
          )}
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

      <div className="flex-1 overflow-auto px-4 py-4" ref={scrollAreaRef}>
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
                  <div className={`whitespace-pre-wrap ${isUser ? 'text-white' : 'text-gray-900'}`}>
                    {m.text}
                    {/* Botão para repetir áudio nas mensagens do assistente */}
                    {!isUser && ttsSupported && (
                      <button
                        onClick={() => speakText(m.text)}
                        className="mt-2 flex items-center gap-1 text-xs text-gray-600 hover:text-primary-600 transition-colors"
                        title="Repetir áudio"
                        aria-label="Repetir áudio"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>Ouvir</span>
                      </button>
                    )}
                  </div>

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
          {/* âncora de scroll */}
          <div ref={scrollEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        {/* Recomendações rápidas acima do input */}
        <div className="mb-2 flex gap-2 overflow-x-auto whitespace-nowrap pb-1 hide-scrollbar">
          {['mocotó', 'peixe', 'artesanato', 'comida', 'frutas'].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setText(suggestion)
                // Foca no textarea após preencher (sem enviar)
                setTimeout(() => {
                  const textarea = document.querySelector('textarea[placeholder*="Pergunte"]') as HTMLTextAreaElement
                  if (textarea) {
                    textarea.focus()
                    // Move o cursor para o final do texto
                    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
                  }
                }, 0)
              }}
              disabled={isSending}
              className="inline-flex flex-shrink-0 items-center rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 border border-primary-200 hover:bg-primary-100 hover:border-primary-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 rounded-institutional border-2 border-gray-300 bg-white px-3 py-2 sm:px-4 sm:py-3 shadow-institutional focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200 min-h-[52px]">
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={isSending}
              className={`inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-institutional transition-all flex-shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg border-2 border-red-700 animate-pulse'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isListening ? 'Parar gravação' : 'Iniciar gravação de voz'}
              title={isListening ? 'Parar gravação' : 'Falar (gravar voz)'}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            placeholder={speechSupported ? "Pergunte por um produto ou setor… ou clique no microfone" : "Pergunte por um produto ou setor…"}
            className="min-w-0 flex-1 bg-transparent text-base font-semibold text-gray-900 placeholder:text-gray-500 focus:outline-none py-1 leading-relaxed resize-none overflow-y-auto"
            rows={1}
            style={{ 
              minHeight: '36px',
              maxHeight: '120px',
              lineHeight: '1.5'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`
            }}
          />
          <button
            disabled={!canSend}
            onClick={() => void send()}
            className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-institutional bg-blue-700 text-white shadow-xl border-2 border-blue-800 transition-all hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex-shrink-0"
            aria-label="Enviar"
          >
            <Send className="h-5 w-5" />
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

