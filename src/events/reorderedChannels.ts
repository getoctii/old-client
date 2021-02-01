import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { Auth } from '../authentication/state'
import { log } from '../utils/logging'
import { CommunityResponse } from '../community/remote'

const useReorderedChannels = (eventSource: EventSourcePolyfill | null) => {
  const { token, id } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource || !token) return
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        community_id: string
        order: string[]
      }
      log('Events', 'purple', 'REORDERED_CHANNELS')
      queryCache.setQueryData<CommunityResponse>(
        ['community', event.community_id, token],
        (initial) => {
          if (initial) {
            return {
              ...initial,
              channels: event.order
            }
          } else {
            return {
              id: event.community_id,
              name: 'unknown',
              icon: '',
              large: false,
              base_permissions: [],
              channels: event.order
            }
          }
        }
      )
    }

    eventSource.addEventListener(Events.REORDERED_CHANNELS, handler)

    return () => {
      eventSource.removeEventListener(Events.REORDERED_CHANNELS, handler)
    }
  }, [eventSource, token, id])
}

export default useReorderedChannels
