import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { Events, ModalTypes } from '../utils/constants'
import { log } from '../utils/logging'
import { UI } from '../state/ui'

const useRinging = (eventSource: EventSourcePolyfill | null) => {
  const { setModal } = UI.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        conversation_id: string
      }
      log('Events', 'purple', 'RINGING')
      setModal({
        name: ModalTypes.RINGING,
        props: { id: event.conversation_id }
      })
    }

    eventSource.addEventListener(Events.RINGING, handler)

    return () => {
      eventSource.removeEventListener(Events.RINGING, handler)
    }
  }, [eventSource, setModal])
}

export default useRinging
