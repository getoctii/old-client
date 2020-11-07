import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { Events } from '../constants'
import { UI } from '../state/ui'

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

      console.log('NEW_VOICE_SESSION', event)
      ui.setModal({
        name: 'incomingCall',
        props: { id: event.id, userID: event.user_id, peerID: event.peer_id }
      })
    }

    eventSource.addEventListener(Events.NEW_VOICE_SESSION, handler)
    return () => {
      eventSource.removeEventListener(Events.NEW_VOICE_SESSION, handler)
    }
  }, [eventSource, ui])
}

export default useNewVoiceSession
