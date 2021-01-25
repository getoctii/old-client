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
      const mention = JSON.parse(e.data)
      log('Events', 'purple', 'NEW_MENTION')
      const initial: Mentions | undefined = queryCache.getQueryData([
        'mentions',
        id,
        token
      ])
      if (initial) {
        queryCache.setQueryData(['mentions', id, token], {
          ...initial,
          [mention.channel_id]: [
            ...(initial[mention.channel_id] ?? []),
            mention
          ]
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
