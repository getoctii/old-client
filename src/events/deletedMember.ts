import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../constants'

const useDeletedMember = (eventSource: EventSourcePolyfill | null) => {
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const member = JSON.parse(e.data)
      queryCache.setQueryData(['communities'], (initial: any) => {
        if (initial) {
          return initial.filter((m: any) => m.id !== member.id)
        } else return initial
      })
    }

    eventSource.addEventListener(Events.DELETED_MEMBER, handler)

    return () => {
      eventSource.removeEventListener(Events.DELETED_MEMBER, handler)
    }
  }, [eventSource])
}

export default useDeletedMember
