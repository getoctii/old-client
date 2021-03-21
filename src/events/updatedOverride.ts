import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { ChannelPermissions, ChannelTypes, Events } from '../utils/constants'
import { Auth } from '../authentication/state'
import { log } from '../utils/logging'
import { ChannelResponse } from '../chat/remote'

const useUpdatedOverride = (eventSource: EventSourcePolyfill | null) => {
  const { token, id } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        channel_id: string
        group_id: string
        allow: ChannelPermissions[]
        deny: ChannelPermissions[]
      }
      log('Events', 'purple', 'UPDATED_OVERRIDE')

      queryCache.setQueryData<ChannelResponse>(
        ['channel', event.channel_id, token],
        (initial) => {
          if (initial) {
            return {
              ...initial,
              overrides: {
                ...initial.overrides,
                [event.group_id]: {
                  allow: event.allow,
                  deny: event.deny
                }
              }
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

    eventSource.addEventListener(Events.UPDATED_OVERRIDE, handler)

    return () => {
      eventSource.removeEventListener(Events.UPDATED_OVERRIDE, handler)
    }
  }, [eventSource, token, id])
}

export default useUpdatedOverride
