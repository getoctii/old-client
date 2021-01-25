import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { useHistory } from 'react-router-dom'
import { CommunityResponse } from '../community/remote'

const useDeletedMember = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  const history = useHistory()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const member = JSON.parse(e.data) as {
        id: string
        community_id: string
      }
      log('Events', 'purple', 'DELETED_MEMBER')
      queryCache.setQueryData(['communities', id, token], (initial) => {
        if (initial instanceof Array) {
          return initial.filter((m: any) => m.id !== member.id)
        } else return initial
      })

      history.push('/')
      const community = queryCache.getQueryData<CommunityResponse>([
        'community',
        member.community_id,
        token
      ])
      if (community?.channels) {
        community.channels.forEach((channelID) => {
          queryCache.removeQueries(['messages', channelID, token])
          queryCache.removeQueries(['channel', channelID, token])
        })
      }

      queryCache.removeQueries(['channels', member.community_id, token])
      queryCache.removeQueries(['community', member.community_id, token])
    }

    eventSource.addEventListener(Events.DELETED_MEMBER, handler)

    return () => {
      eventSource.removeEventListener(Events.DELETED_MEMBER, handler)
    }
  }, [eventSource, id, token, history])
}

export default useDeletedMember
