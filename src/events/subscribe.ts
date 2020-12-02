import { EventSourcePolyfill } from 'event-source-polyfill'
import { useEffect, useState } from 'react'
import { queryCache } from 'react-query'
import { Auth } from '../authentication/state'
import { CLIENT_GATEWAY_URL } from '../utils/constants'
import { getCommunities, getParticipants, getUnreads } from '../user/remote'

const useSubscribe = () => {
  const { token, id } = Auth.useContainer()
  const [eventSource, setEventSource] = useState<EventSourcePolyfill | null>(
    null
  )
  useEffect(() => {
    if (!token) return
    const source = new EventSourcePolyfill(
      `${CLIENT_GATEWAY_URL}/events/subscribe/${id}`,
      {
        headers: {
          Authorization: token
        }
      }
    )

    setEventSource(source)

    queryCache.prefetchQuery(['communities', id, token], getCommunities)
    queryCache.prefetchQuery(['participants', id, token], getParticipants)
    queryCache.prefetchQuery(['unreads', id, token], getUnreads)

    return () => {
      source.close()
    }
  }, [token, id])
  return [eventSource]
}

export default useSubscribe
