import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'

const useNewGroupMember = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        user_id: string
        member_id: string
        group_id: string
        community_id: string
      }
      log('Events', 'purple', 'NEW_GROUP_MEMBER')
      await queryCache.invalidateQueries(['member', event.member_id, token])
    }

    eventSource.addEventListener(Events.NEW_GROUP_MEMBER, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_GROUP_MEMBER, handler)
    }
  }, [eventSource, id, token])
}

export default useNewGroupMember
