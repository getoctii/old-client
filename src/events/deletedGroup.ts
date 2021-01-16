import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'

const useDeletedGroup = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event: {
        id: string
        community_id: string
      } = JSON.parse(e.data)
      log('Events', 'purple', 'DELETED_GROUP')
      const initial = queryCache.getQueryData([
        'groups',
        event.community_id,
        token
      ])

      if (initial instanceof Array) {
        queryCache.setQueryData(
          ['groups', event.community_id, token],
          initial.filter((group) => group.id !== event.id)
        )
      }
    }

    eventSource.addEventListener(Events.DELETED_GROUP, handler)

    return () => {
      eventSource?.removeEventListener(Events.DELETED_GROUP, handler)
    }
  }, [eventSource, id, token])
}

export default useDeletedGroup
