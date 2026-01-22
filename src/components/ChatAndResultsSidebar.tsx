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
        />
      </div>
      {resultsQuery ? (
        <ResultsPanel query={resultsQuery} results={results} onSelectPoi={onSelectPoi} onShowInfo={onShowInfo} />
      ) : null}
    </div>
  )
}

