import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { ChannelTypes, Events } from '../utils/constants'
import { Auth } from '../authentication/state'
import { log } from '../utils/logging'
import { ChannelResponse } from '../chat/remote'

const useDeletedOverride = (eventSource: EventSourcePolyfill | null) => {
  const { token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        channel_id: string
        group_id: string
      }
      log('Events', 'purple', 'DELETED_OVERRIDE')

      queryCache.setQueryData<ChannelResponse>(
        ['channel', event.channel_id, token],
        (initial) => {
          if (initial) {
            return {
              ...initial,
              overrides: Object.fromEntries(
                Object.entries(initial?.overrides ?? {}).filter(
                  ([id]) => id !== event.group_id
                )
              )
            }
          } else {
            return {
              id: event.channel_id,
              name: '',
              type: ChannelTypes.CUSTOM,
              order: 0
            }
          }
        }
      )
    }

    eventSource.addEventListener(Events.DELETED_OVERRIDE, handler)

    return () => {
      eventSource.removeEventListener(Events.DELETED_OVERRIDE, handler)
    }
  }, [eventSource, token])
}

export default useDeletedOverride
