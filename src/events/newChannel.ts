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
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        id: string
        community_id: string
        name: string
      }
      log('Events', 'purple', 'NEW_CHANNEL')

      await queryCache.invalidateQueries([
        'channels',
        event.community_id,
        token
      ])

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
