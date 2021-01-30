import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { MemberResponse } from '../community/remote'

const useDeletedGroup = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        id: string
        community_id: string
      }
      log('Events', 'purple', 'DELETED_GROUP')
      queryCache.setQueryData<string[]>(
        ['groups', event.community_id, token],
        (initial) =>
          initial ? initial.filter((group) => group !== event.id) : []
      )

      const member = queryCache.getQueryData<MemberResponse>([
        'memberByUserID',
        event.community_id,
        id,
        token
      ])
      if (member?.groups?.includes(event.id)) {
        queryCache.setQueryData<MemberResponse>(
          ['memberByUserID', event.community_id, id, token],
          {
            ...member,
            groups: member.groups.filter((group) => group !== event.id)
          }
        )
        await queryCache.invalidateQueries('group')
        await queryCache.invalidateQueries([
          'memberGroups',
          member.groups,
          token
        ])
      }
    }

    eventSource.addEventListener(Events.DELETED_GROUP, handler)

    return () => {
      eventSource?.removeEventListener(Events.DELETED_GROUP, handler)
    }
  }, [eventSource, id, token])
}

export default useDeletedGroup
