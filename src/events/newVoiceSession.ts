import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { Events, ModalTypes } from '../utils/constants'
import { UI } from '../state/ui'
import { log } from '../utils/logging'

const useNewVoiceSession = (eventSource: EventSourcePolyfill | null) => {
  const ui = UI.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        id: string
        user_id: string
        peer_id: string
      }
      log('Events', 'purple', 'NEW_VOICE_SESSION')
    }

    eventSource.addEventListener(Events.NEW_VOICE_SESSION, handler)
    return () => {
      eventSource.removeEventListener(Events.NEW_VOICE_SESSION, handler)
    }
  }, [eventSource, ui])
}

export default useNewVoiceSession
