import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { Auth } from '../authentication/state'
import { log } from '../utils/logging'

const useDeletedChannel = (eventSource: EventSourcePolyfill | null) => {
  const { token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const channel = JSON.parse(e.data)
      log('Events', 'purple', 'DELETED_CHANNEL')
      queryCache.setQueryData(
        ['community', channel.community_id, token],
        (initial: any) => {
          if (initial) {
            console.log({
              ...initial,
              channels: initial.channels.filter((c: any) => c.id !== channel.id)
            })
            return {
              ...initial,
              channels: initial.channels.filter((c: any) => c.id !== channel.id)
            }
          } else return initial
        }
      )
    }

    eventSource.addEventListener(Events.DELETED_CHANNEL, handler)

    return () => {
      eventSource.removeEventListener(Events.DELETED_CHANNEL, handler)
    }
  }, [eventSource, token])
}

export default useDeletedChannel
