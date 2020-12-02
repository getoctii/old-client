import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { Events } from '../utils/constants'
import Typing from '../state/typing'
import { log } from '../utils/logging'

const useTyping = (eventSource: EventSourcePolyfill | null) => {
  const { startTyping } = Typing.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        channel_id: string
        user_id: string
        username: string
      }
      log('Events', 'purple', 'TYPING')
      startTyping(event.channel_id, event.user_id, event.username)
    }

    eventSource.addEventListener(Events.TYPING, handler)

    return () => {
      eventSource.removeEventListener(Events.TYPING, handler)
    }
  })
}

export default useTyping
