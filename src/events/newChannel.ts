import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { Auth } from '../authentication/state'
import { log } from '../utils/logging'

const useNewChannel = (eventSource: EventSourcePolyfill | null) => {
  const { token, id } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        id: string
        community_id: string
        name: string
      }
      log('Events', 'purple', 'NEW_CHANNEL')
      queryCache.setQueryData(
        ['community', event.community_id, token],
        (initial: any) => {
          if (initial) {
            initial.channels.push(event.id)
            return initial
          } else return initial
        }
      )

      queryCache.setQueryData(['unreads', id, token], (initial: any) => ({
        ...initial,
        [event.id]: {}
      }))
    }

    eventSource.addEventListener(Events.NEW_CHANNEL, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_CHANNEL, handler)
    }
  }, [eventSource, token, id])
}

export default useNewChannel
