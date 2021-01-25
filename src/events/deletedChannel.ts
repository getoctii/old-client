import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { Auth } from '../authentication/state'
import { log } from '../utils/logging'
import { CommunityResponse } from '../community/remote'
import { useHistory, useRouteMatch } from 'react-router-dom'

const useDeletedChannel = (eventSource: EventSourcePolyfill | null) => {
  const { token } = Auth.useContainer()
  const history = useHistory()
  const match = useRouteMatch<{ id: string, channelID: string }>('/communities/:id/channels/:channelID')
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        community_id: string,
        id:  string
      }
      log('Events', 'purple', 'DELETED_CHANNEL')
      queryCache.setQueryData<CommunityResponse>(
        ['community', event.community_id, token],
        initial => {
          if (initial) {
            return {
              ...initial,
              channels: initial.channels.filter((channelID) => channelID!== event.id)
            }
          } else return { id: event.community_id, channels: [event.id], large: false, name: 'unknown', icon: undefined, owner_id: undefined }
        }
      )
      if (match?.params.channelID === event.id) history.push(`/communities/${match.params.id}`)
    }

    eventSource.addEventListener(Events.DELETED_CHANNEL, handler)

    return () => {
      eventSource.removeEventListener(Events.DELETED_CHANNEL, handler)
    }
  }, [eventSource, token, history, match?.params.channelID, match?.params.id])
}

export default useDeletedChannel
