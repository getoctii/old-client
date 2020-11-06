import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../constants'

const useDeletedParticipant = (eventSource: EventSourcePolyfill | null) => {
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const participant = JSON.parse(e.data)
      queryCache.setQueryData('participants', (initial) => {
        if (initial instanceof Array) {
          console.log(initial.filter((p) => p.id !== participant.id))
          return initial.filter((p) => p.id !== participant.id)
        } else return initial
      })
    }

    eventSource.addEventListener(Events.DELETED_PARTICIPANT, handler)

    return () => {
      eventSource?.removeEventListener(Events.DELETED_PARTICIPANT, handler)
    }
  }, [eventSource])
}

export default useDeletedParticipant
