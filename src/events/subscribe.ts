import { EventSourcePolyfill } from 'event-source-polyfill'
import { useEffect, useState } from 'react'
import { queryCache } from 'react-query'
import { Auth } from '../authentication/state'
import { clientGateway, CLIENT_GATEWAY_URL } from '../constants'

type MembersResponse = {
  id: string
  community: {
    id: string
    name: string
    icon?: string
    large: boolean
  }
}[]

type Participant = {
  id: string
  conversation: {
    id: string
    channel_id: string
    participants: string[]
  }
}

type ParticipantsResponse = Participant[]

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

    queryCache.prefetchQuery(
      'communities',
      async () =>
        (
          await clientGateway.get<MembersResponse>(`/users/${id}/members`, {
            headers: {
              Authorization: token
            }
          })
        ).data
    )

    queryCache.prefetchQuery(
      'participants',
      async () =>
        (
          await clientGateway.get<ParticipantsResponse>(
            `/users/${id}/participants`,
            {
              headers: {
                Authorization: token
              }
            }
          )
        ).data
    )

    return () => {
      source.close()
    }
  }, [token, id])
  return [eventSource]
}

export default useSubscribe
