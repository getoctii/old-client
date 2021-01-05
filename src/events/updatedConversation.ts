import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { Events } from '../utils/constants'
import { queryCache } from 'react-query'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { ParticipantsResponse } from '../user/remote'

const useUpdatedConversation = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()

  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        conversation_id: string
        participants: string[]
      }
      log('Events', 'purple', 'UPDATED_CONVERSATION')

      const initial:
        | ParticipantsResponse
        | undefined = queryCache.getQueryData(['participants', id, token])

      if (initial) {
        queryCache.setQueryData(
          ['participants', id, token],
          initial.map((p) =>
            p.conversation.id === event.conversation_id
              ? {
                  ...p,
                  conversation: {
                    ...p.conversation,
                    participants: event.participants
                  }
                }
              : p
          )
        )
      }
    }

    eventSource.addEventListener(Events.UPDATED_CONVERSATION, handler)

    return () => {
      eventSource.removeEventListener(Events.UPDATED_CONVERSATION, handler)
    }
  }, [eventSource, id, token])
}

export default useUpdatedConversation
