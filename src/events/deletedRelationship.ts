import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { RelationshipResponse } from '../hub/friends/remote'

const useDeletedRelationship = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        user_id: string
        recipient_id: string
      }
      log('Events', 'purple', 'DELETED_RELATIONSHIP')
      queryCache.setQueryData<RelationshipResponse[]>(
        ['relationships', id, token],
        (initial) =>
          initial?.filter(
            (relationship) =>
              !(
                (relationship.user_id === event.user_id &&
                  relationship.recipient_id === event.recipient_id) ||
                (relationship.user_id === event.recipient_id &&
                  relationship.recipient_id === event.user_id)
              )
          ) ?? []
      )
    }

    eventSource.addEventListener(Events.DELETED_RELATIONSHIP, handler)

    return () => {
      eventSource.removeEventListener(Events.DELETED_RELATIONSHIP, handler)
    }
  }, [eventSource, id, token])
}

export default useDeletedRelationship
