import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../constants'

const useNewParticipant = (eventSource: EventSourcePolyfill | null) => {
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const participant = JSON.parse(e.data)
      queryCache.setQueryData('participants', (initial) => {
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
  }, [eventSource])
}

export default useNewParticipant
