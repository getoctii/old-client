import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { Auth } from '../authentication/state'
import { log } from '../utils/logging'
import { MembersResponse } from '../user/remote'

const useNewGroup = (eventSource: EventSourcePolyfill | null) => {
  const { token, id } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        id: string
        community_id: string
      }
      log('Events', 'purple', 'NEW_GROUP')
      queryCache.setQueryData<string[]>(
        ['groups', event.community_id, token],
        (initial) => (initial ? [...initial, event.id] : [event.id])
      )
      const communities = queryCache.getQueryData<MembersResponse>([
        'communities',
        id,
        token
      ])
      const member = communities?.find(
        (m) => m.community.id === event.community_id
      )
      if (!!member?.id)
        await queryCache.invalidateQueries(['member', member.id, token])
    }

    eventSource.addEventListener(Events.NEW_GROUP, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_GROUP, handler)
    }
  }, [eventSource, token, id])
}

export default useNewGroup
