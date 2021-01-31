import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { ParticipantsResponse } from '../user/remote'

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
      queryCache.setQueryData<ParticipantsResponse>(
        ['participants', id, token],
        (initial) => {
          if (initial) {
            return [...initial, participant]
          } else {
            return [participant]
          }
        }
      )
    }

    eventSource.addEventListener(Events.NEW_PARTICIPANT, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_PARTICIPANT, handler)
    }
  }, [eventSource, id, token])
}

export default useNewParticipant
