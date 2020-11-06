import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../constants'
import { Auth } from '../authentication/state'

const useNewChannel = (eventSource: EventSourcePolyfill | null) => {
  const { token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const channel = JSON.parse(e.data)
      console.log('channel', channel)
      queryCache.setQueryData(
        ['community', channel.community_id, token],
        (initial: any) => {
          console.log('initial', initial)
          if (initial) {
            initial.channels.push({
              id: channel.id,
              name: channel.name
            })
            return initial
          } else return initial
        }
      )
    }

    eventSource.addEventListener(Events.NEW_CHANNEL, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_CHANNEL, handler)
    }
  }, [eventSource, token])
}

export default useNewChannel
