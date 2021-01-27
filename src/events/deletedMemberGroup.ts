import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { MemberResponse } from '../community/remote'

const useDeletedMemberGroup = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        member_id: string
        group_id: string
        community_id: string
      }
      log('Events', 'purple', 'DELETED_MEMBER_GROUP')

      queryCache.setQueryData<MemberResponse>(
        ['member', event.member_id, token],
        (initial) => {
          if (initial) {
            return {
              ...initial,
              groups: initial.groups.filter((group) => group !== event.group_id)
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
      // queryCache.setQueryData(
      //   ['members', event.community_id, token],
      //   (initial) => {
      //     if (initial instanceof Array) {
      //       return (initial as MemberResponse[]).map((member) =>
      //         member.id === event.member_id
      //           ? {
      //               ...member,
      //               groups: member.groups.filter(
      //                 (group) => group !== event.group_id
      //               )
      //             }
      //           : member
      //       )
      //     } else return initial
      //   }
      // )
    }

    eventSource.addEventListener(Events.DELETED_MEMBER_GROUP, handler)

    return () => {
      eventSource?.removeEventListener(Events.DELETED_MEMBER_GROUP, handler)
    }
  }, [eventSource, id, token])
}

export default useDeletedMemberGroup
