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
      const event = JSON.parse(e.data) as {
        id: string
        community: {
          id: string
          name: string
          icon?: string
          large: boolean
          owner_id: string
        }
      }
      log('Events', 'purple', 'NEW_MEMBER')
      queryCache.setQueryData(['communities', id, token], (initial) => {
        if (initial instanceof Array) {
          initial.push(event)
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
