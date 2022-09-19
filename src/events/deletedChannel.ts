import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { Auth } from '../authentication/state'
import { log } from '../utils/logging'
import { useHistory, useRouteMatch } from 'react-router-dom'

const useDeletedChannel = (eventSource: EventSourcePolyfill | null) => {
  const { token } = Auth.useContainer()
  const history = useHistory()
  const match = useRouteMatch<{ id: string; channelID: string }>(
    '/communities/:id/channels/:channelID'
  )
  useEffect(() => {
    if (!eventSource) return
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        community_id: string
        id: string
      }
      log('Events', 'purple', 'DELETED_CHANNEL')
      await queryCache.invalidateQueries([
        'channels',
        event.community_id,
        token
      ])

      if (match?.params.channelID === event.id)
        history.push(`/communities/${match.params.id}`)
    }

    eventSource.addEventListener(Events.DELETED_CHANNEL, handler)

    return () => {
      eventSource.removeEventListener(Events.DELETED_CHANNEL, handler)
    }
  }, [eventSource, token, history, match?.params.channelID, match?.params.id])
}

export default useDeletedChannel
