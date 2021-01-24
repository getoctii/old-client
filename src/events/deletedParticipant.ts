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
      const event: {
        id: string
        user_id: string
        conversation_id: string
      } = JSON.parse(e.data)
      log('Events', 'purple', 'DELETED_PARTICIPANT')

      const participants = queryCache.getQueryData<ParticipantsResponse>([
        'participants',
        id,
        token
      ])
      const participant = participants?.find(
        (p) => p.conversation.id === event.conversation_id
      )

      queryCache.setQueryData(['participants', id, token], (initial) => {
        if (initial instanceof Array) {
          return (initial as ParticipantsResponse)
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
        } else return initial
      })

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
