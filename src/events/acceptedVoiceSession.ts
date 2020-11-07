import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { Events } from '../constants'
import { Call } from '../state/call'

const useAcceptedVoiceSession = (eventSource: EventSourcePolyfill | null) => {
  const call = Call.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        id: string
        peer_id: string
      }
      console.log('ACCPETED_VOICE_SESSION', event)
      call.establishCall(event.id, event.peer_id)
    }

    eventSource.addEventListener(Events.ACCPETED_VOICE_SESSION, handler)
    return () => {
      eventSource.removeEventListener(Events.ACCPETED_VOICE_SESSION, handler)
    }
  }, [eventSource, call])
}

export default useAcceptedVoiceSession
