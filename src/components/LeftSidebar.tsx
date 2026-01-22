import { useState } from 'react'
import { MessageSquareText, ListOrdered } from 'lucide-react'
import type { ChatMessage, Poi } from '../types'
import { ResultsSidebar } from './ResultsSidebar'
import { ChatSidebar } from './ChatSidebar'

type Props = {
  pois: Poi[]
  messages: ChatMessage[]
  onMessagesChange: (messages: ChatMessage[]) => void
  onSelectPoi: (poiId: string) => void
}

export function LeftSidebar({ pois, messages, onMessagesChange, onSelectPoi }: Props) {
  const [tab, setTab] = useState<'RESULTS' | 'CHAT'>('RESULTS')

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-zinc-200 p-2">
        <button
          onClick={() => setTab('RESULTS')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
            tab === 'RESULTS' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <ListOrdered className="h-4 w-4" />
          Resultados
        </button>
        <button
          onClick={() => setTab('CHAT')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
            tab === 'CHAT' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <MessageSquareText className="h-4 w-4" />
          Chat
        </button>
      </div>

      <div className="min-h-0 flex-1">
        {tab === 'RESULTS' ? (
          <ResultsSidebar pois={pois} onSelectPoi={onSelectPoi} />
        ) : (
          <ChatSidebar
            pois={pois}
            messages={messages}
            onMessagesChange={onMessagesChange}
            onSelectPoi={onSelectPoi}
          />
        )}
      </div>
    </div>
  )
}

