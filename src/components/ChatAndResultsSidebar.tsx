import type { ChatMessage, Poi } from '../types'
import { ChatSidebar } from './ChatSidebar'
import { ResultsPanel } from './ResultsPanel'

type Props = {
  pois: Poi[]
  messages: ChatMessage[]
  onMessagesChange: (messages: ChatMessage[]) => void
  resultsQuery: string
  results: Poi[]
  onResults: (query: string, results: Poi[]) => void
  onSelectPoi: (poiId: string) => void
  onShowInfo?: (poiId: string) => void
  /** Texto inicial vindo de atalho (ex: Home -> Buscar) */
  initialChatText?: string
  /** Se true, envia automaticamente o texto inicial */
  autoSendInitialChatText?: boolean
}

export function ChatAndResultsSidebar({
  pois,
  messages,
  onMessagesChange,
  resultsQuery,
  results,
  onResults,
  onSelectPoi,
  onShowInfo,
  initialChatText,
  autoSendInitialChatText,
}: Props) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-0 flex-1">
        <ChatSidebar
          pois={pois}
          messages={messages}
          onMessagesChange={onMessagesChange}
          onSelectPoi={onSelectPoi}
          onResults={onResults}
          initialDraft={initialChatText}
          autoSendInitial={autoSendInitialChatText}
        />
      </div>
      {resultsQuery ? (
        <ResultsPanel query={resultsQuery} results={results} onSelectPoi={onSelectPoi} onShowInfo={onShowInfo} />
      ) : null}
    </div>
  )
}

