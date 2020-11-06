import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../constants'

const useNewMember = (eventSource: EventSourcePolyfill | null) => {
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const member = JSON.parse(e.data)
      console.log('member', member)
      queryCache.setQueryData(['communities'], (initial) => {
        if (initial instanceof Array) {
          initial.push(member)
          return initial
        } else return initial
      })
    }

    eventSource.addEventListener(Events.NEW_MEMBER, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_MEMBER, handler)
    }
  }, [eventSource])
}

export default useNewMember
