import React, { Suspense } from 'react'
import styles from './Conversation.module.scss'
import Chat from '../chat/Chat'
import { useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { ChannelTypes, clientGateway } from '../constants'
import Loader from '../components/Loader'
import { UserResponse } from '../user/remote'

type ParticipantsResponse = {
  id: string
  conversation: {
    id: string
    channel_id: string
    participants: string[]
  }
}[]

export const Conversation = () => {
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const auth = Auth.useContainer()
  const { data } = useQuery(
    'participants',
    async () =>
      (
        await clientGateway.get<ParticipantsResponse>(
          `/users/${auth.id}/participants`,
          {
            headers: {
              Authorization: auth.token
            }
          }
        )
      ).data
  )
  const participant = data?.find(
    (participant) => participant.conversation.id === match?.params.id
  )
  const people = participant?.conversation.participants.filter(
    (userID) => userID !== auth.id
  )

  const recipient = useQuery(
    ['users', people?.[0]],
    async (key, userID) =>
      (
        await clientGateway.get<UserResponse>(`/users/${userID}`, {
          headers: { Authorization: auth.token }
        })
      ).data
  )
  if (!participant) return <></>
  return (
    <Suspense fallback={<Loader />}>
      <div
        className={styles.conversation}
        key={participant.conversation.channel_id}
      >
        <Chat
          type={ChannelTypes.PrivateChannel}
          channel={{
            id: participant.conversation.channel_id
          }}
          user={recipient.data}
        />
      </div>
    </Suspense>
  )
}
