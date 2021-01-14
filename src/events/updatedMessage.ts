import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { Events } from '../utils/constants'
import { queryCache } from 'react-query'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { ParticipantsResponse } from '../user/remote'
import { Message } from '../chat/remote'

const useUpdatedMessage = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()

  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        id: string
        channel_id: string
        content: string
        updated_at: string
      }
      log('Events', 'purple', 'UPDATED_MESSAGE')

      const initial: Message[] | undefined = queryCache.getQueryData([
        'messages',
        event.channel_id,
        token
      ])

      if (initial) {
        queryCache.setQueryData(
          ['messages', event.channel_id, token],
          initial.map((p) =>
            p.id === event.id
              ? {
                  ...p,
                  content: event.content,
                  updated_at: event.updated_at
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

export default useUpdatedMessage
