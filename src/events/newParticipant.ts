import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'

const useNewParticipant = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const participant = JSON.parse(e.data) as {
        id: string
        conversation: {
          id: string
          channel_id: string
          last_message_id: string
          participants: string[]
        }
      }
      log('Events', 'purple', 'NEW_PARTICIPANT')
      queryCache.setQueryData(['participants', id, token], (initial) => {
        if (initial instanceof Array) {
          initial.push(participant)
          return initial
        } else return initial
      })
    }

    eventSource.addEventListener(Events.NEW_PARTICIPANT, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_PARTICIPANT, handler)
    }
  }, [eventSource, id, token])
}

export default useNewParticipant
