import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { MemberResponse } from '../community/remote'

const useNewGroupMember = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        user_id: string
        member_id: string
        group_id: string
        community_id: string
      }
      log('Events', 'purple', 'NEW_GROUP_MEMBER')
      queryCache.setQueryData<MemberResponse>(
        ['member', event.member_id, token],
        (initial) => {
          if (initial) {
            return {
              ...initial,
              groups: [...initial.groups, event.group_id]
            }
          } else {
            return {
              id: event.member_id,
              user_id: '',
              created_at: '',
              updated_at: '',
              groups: []
            }
          }
        }
      )
      queryCache.setQueryData<MemberResponse>(
        ['memberByUserID', event.community_id, event.user_id, token],
        (initial) => {
          if (initial) {
            return {
              ...initial,
              groups: [...initial.groups, event.group_id]
            }
          } else {
            return {
              id: event.member_id,
              user_id: '',
              created_at: '',
              updated_at: '',
              groups: []
            }
          }
        }
      )
    }

    eventSource.addEventListener(Events.NEW_GROUP_MEMBER, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_GROUP_MEMBER, handler)
    }
  }, [eventSource, id, token])
}

export default useNewGroupMember
