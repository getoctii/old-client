import { useEffect, useState } from 'react'
import { queryCache } from 'react-query'
import { Auth } from '../authentication/state'
import { CLIENT_GATEWAY_URL } from '../utils/constants'
import {
  getCommunities,
  getMentions,
  getParticipants,
  getUnreads
} from '../user/remote'

const useSubscribe = () => {
  const { token, id } = Auth.useContainer()
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  useEffect(() => {
    if (!token) return
    const source = new EventSource(
      `${CLIENT_GATEWAY_URL}/events/subscribe/${id}?authorization=${token}`
    )

    setEventSource(source)

    queryCache.prefetchQuery(['communities', id, token], getCommunities)
    queryCache.prefetchQuery(['participants', id, token], getParticipants)
    queryCache.prefetchQuery(['unreads', id, token], getUnreads)
    queryCache.prefetchQuery(['mentions', id, token], getMentions)

    return () => {
      source.close()
    }
  }, [token, id])
  return [eventSource]
}

export default useSubscribe
