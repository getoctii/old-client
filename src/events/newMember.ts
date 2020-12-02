import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'

const useNewMember = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()

  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const member = JSON.parse(e.data)
      log('Events', 'purple', 'NEW_MEMBER')
      queryCache.setQueryData(['communities', id, token], (initial) => {
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
  }, [eventSource, id, token])
}

export default useNewMember
