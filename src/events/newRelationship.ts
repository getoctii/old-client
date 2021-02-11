import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { RelationshipResponse, RelationshipTypes } from '../friends/remote'

const useNewRelationship = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        user_id: string
        recipient_id: string
        type: RelationshipTypes
      }
      log('Events', 'purple', 'NEW_RELATIONSHIP')
      console.log(event)
      if (event.type === RelationshipTypes.FRIEND) {
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

      queryCache.setQueryData<RelationshipResponse[]>(
        ['relationships', id, token],
        (initial) => (initial ? [...initial, { ...event }] : [{ ...event }])
      )
    }

    eventSource.addEventListener(Events.NEW_RELATIONSHIP, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_RELATIONSHIP, handler)
    }
  }, [eventSource, id, token])
}

export default useNewRelationship
