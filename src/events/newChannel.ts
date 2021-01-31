import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { Auth } from '../authentication/state'
import { log } from '../utils/logging'
import { CommunityResponse } from '../community/remote'

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
      queryCache.setQueryData<CommunityResponse>(
        ['community', event.community_id, token],
        (initial) => {
          if (initial) {
            return {
              ...initial,
              channels: [...initial.channels, event.id]
            }
          } else {
            return {
              id: event.community_id,
              name: 'unknown',
              icon: '',
              large: false,
              base_permissions: [],
              owner_id: '',
              channels: [event.id]
            }
          }
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
