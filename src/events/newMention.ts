import { Auth } from '../authentication/state'
import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { log } from '../utils/logging'
import { queryCache } from 'react-query'
import { Mentions } from '../user/remote'
import { Events } from '../utils/constants'

const useNewMention = (eventSource: EventSourcePolyfill | null) => {
  const { token, id } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        id: string
        user_id: string
        message_id: string
        read: boolean
        channel_id: string
      }
      log('Events', 'purple', 'NEW_MENTION')
      const initial: Mentions | undefined = queryCache.getQueryData([
        'mentions',
        id,
        token
      ])
      if (initial) {
        queryCache.setQueryData(['mentions', id, token], {
          ...initial,
          [event.channel_id]: [...(initial[event.channel_id] ?? []), event]
        })
      }
    }

    eventSource.addEventListener(Events.NEW_MENTION, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_MENTION, handler)
    }
  })
}

export default useNewMention
