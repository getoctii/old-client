import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { ParticipantsResponse } from '../user/remote'

const useDeletedParticipant = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        id: string
        user_id: string
        conversation_id: string
      }
      log('Events', 'purple', 'DELETED_PARTICIPANT')

      const participants = queryCache.getQueryData<ParticipantsResponse>([
        'participants',
        id,
        token
      ])
      const participant = participants?.find(
        (p) => p.conversation.id === event.conversation_id
      )

      queryCache.setQueryData<ParticipantsResponse>(
        ['participants', id, token],
        (initial) => {
          if (initial) {
            return initial
              .filter((p) => p.id !== event.id)
              .map((p) =>
                p.conversation.id === event.conversation_id
                  ? {
                      ...p,
                      conversation: {
                        ...p.conversation,
                        participants: p.conversation.participants.filter(
                          (p) => p !== event.user_id
                        )
                      }
                    }
                  : p
              )
          } else {
            return []
          }
        }
      )

      if (event.user_id === id)
        queryCache.removeQueries([
          'messages',
          participant?.conversation.channel_id,
          token
        ])
    }
    eventSource.addEventListener(Events.DELETED_PARTICIPANT, handler)

    return () => {
      eventSource?.removeEventListener(Events.DELETED_PARTICIPANT, handler)
    }
  }, [eventSource, id, token])
}

export default useDeletedParticipant
