import React from 'react'
import styles from './Community.module.scss'
import Chat from './chat/Chat'
import { useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'

type ParticipantsResponse = {
  id: string
  conversation: {
    id: string
    channel_id: string
    participants: string[]
  }
}[]

export const Community = () => {
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const auth = Auth.useContainer()
  const { data } = useQuery('participants', async () => (await clientGateway.get<ParticipantsResponse>(`/users/${auth.id}/participants`, {
    headers: {
      Authorization: auth.token
    }
  })).data)
  const participant = data?.find((participant) => participant.conversation.id === match?.params.id)
  if (!participant) return <></>
  return (
    <div className={styles.community}>
      <Chat channelID={participant.conversation.channel_id}/>
    </div>
  )
}
