import React, { Suspense, useMemo } from 'react'
import styles from './Conversation.module.scss'
import Chat from '../chat/Channel'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { ChannelTypes } from '../utils/constants'
import { getParticipants } from '../user/remote'
import { Conversations } from './Conversations'
import { useLocalStorage, useMedia } from 'react-use'
import Empty from './empty/Empty'
import Sidebar from '../sidebar/Sidebar'

const Conversation = () => {
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const { id, token } = Auth.useContainer()
  const { data } = useQuery(['participants', id, token], getParticipants)

  const participant = useMemo(
    () =>
      data?.find(
        (participant) => participant.conversation.id === match?.params.id
      ),
    [data, match]
  )
  const people = useMemo(
    () =>
      participant?.conversation.participants.filter((userID) => userID !== id),
    [participant, id]
  )

  if (!participant) return <></>
  return (
    <Suspense fallback={<Chat.Placeholder />}>
      <div
        className={styles.conversation}
        key={participant.conversation.channel_id}
      >
        <Chat.View
          type={
            (people?.length ?? 0) > 1
              ? ChannelTypes.GroupChannel
              : ChannelTypes.PrivateChannel
          }
          channelID={participant.conversation.channel_id}
          conversationID={match?.params.id}
          participants={people}
          key={participant.conversation.channel_id}
        />
      </div>
    </Suspense>
  )
}

const Router = () => {
  const { id, token } = Auth.useContainer()
  const isMobile = useMedia('(max-width: 940px)')
  const match = useRouteMatch<{ id: string }>('/conversations/:id')

  const [lastConversation] = useLocalStorage('last_conversation')
  const participants = useQuery(['participants', id, token], getParticipants)
  const history = useHistory()
  const filteredParticipants =
    participants.data?.filter(
      (part) => part.conversation.participants.length > 1
    ) || []

  if (!match?.params.id && filteredParticipants.length > 0 && !isMobile) {
    history.push(
      `/conversations/${
        lastConversation &&
        filteredParticipants.find((p) => p.conversation.id === lastConversation)
          ? lastConversation
          : filteredParticipants[0].conversation.id
      }`
    )
  } else if (
    match?.params.id &&
    filteredParticipants.length === 0 &&
    filteredParticipants.find((p) => p.conversation.id !== match.params.id)
  ) {
    history.push('/')
  } else if (
    match?.params.id &&
    filteredParticipants.length > 0 &&
    !filteredParticipants.find((p) => p.conversation.id === match.params.id)
  ) {
    history.push(`/conversations/${filteredParticipants[0].conversation.id}`)
  }
  return (
    <>
      {match?.params.id &&
      filteredParticipants.find(
        (p) => p.conversation.id === match.params.id
      ) ? (
        <>
          {!isMobile && <Conversations />}
          <Suspense fallback={<Chat.Placeholder />}>
            <Conversation />
          </Suspense>
        </>
      ) : isMobile ? (
        <>
          <Sidebar />
          <Conversations />
        </>
      ) : (
        <Empty />
      )}
    </>
  )
}

export default Router
