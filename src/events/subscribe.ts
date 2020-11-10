import { EventSourcePolyfill } from 'event-source-polyfill'
import { useEffect, useState } from 'react'
import { Auth } from '../authentication/state'
import { CLIENT_GATEWAY_URL } from '../constants'

const useSubscribe = () => {
  const { token, id } = Auth.useContainer()
  const [eventSource, setEventSource] = useState<EventSourcePolyfill | null>(
    null
  )
  useEffect(() => {
    if (!token) return
    const source = new EventSourcePolyfill(
      CLIENT_GATEWAY_URL + '/events/subscribe/' + id,
      {
        headers: {
          Authorization: token
        }
      }
    )

    setEventSource(source)

    return () => {
      source.close()
    }
  }, [token, id])
  // useSubsribe sounds the least weird
  return [eventSource]
}

export default useSubscribe
