import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { Auth } from '../authentication/state'
import { log } from '../utils/logging'
import { MembersResponse } from '../user/remote'
import { MemberResponse } from '../community/remote'

const useReorderedGroups = (eventSource: EventSourcePolyfill | null) => {
  const { token, id } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource || !token) return
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        community_id: string
        order: string[]
      }
      log('Events', 'purple', 'REORDERED_GROUPS')
      queryCache.setQueryData(
        ['groups', event.community_id, token],
        event.order.reverse()
      )
      const communities = queryCache.getQueryData<MembersResponse>([
        'communities',
        id,
        token
      ])
      const member = communities?.find(
        (m) => m.community.id === event.community_id
      )
      if (!!member?.id) {
        const memberGroups = queryCache.getQueryData<MemberResponse>([
          'member',
          member.id,
          token
        ])
        if (memberGroups?.groups?.some((g) => event.order.includes(g))) {
          await queryCache.invalidateQueries(['member', member.id, token])
        }
      }
    }

    eventSource.addEventListener(Events.REORDERED_GROUPS, handler)

    return () => {
      eventSource.removeEventListener(Events.REORDERED_GROUPS, handler)
    }
  }, [eventSource, token, id])
}

export default useReorderedGroups
