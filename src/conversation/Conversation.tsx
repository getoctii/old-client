import React, { Suspense, useEffect, useMemo } from 'react'
import styles from './Conversation.module.scss'
import Chat from '../chat/Channel'
import { Redirect, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { InternalChannelTypes } from '../utils/constants'
import { getParticipants, Participant } from '../user/remote'
import { Conversations } from './Conversations'
import { useLocation, useMedia } from 'react-use'
import Empty from './empty/Empty'
import Sidebar from '../sidebar/Sidebar'
import dayjs from 'dayjs'
import { useSuspenseStorageItem } from '../utils/storage'
import { Helmet } from 'react-helmet-async'
import { Permission } from '../utils/permissions'
import { PrivateRoute } from '../authentication/PrivateRoute'

const ConversationView = () => {
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const { id, token } = Auth.useContainer()
  const { data: participants } = useQuery(
    ['participants', id, token],
    getParticipants
  )

  const participant = useMemo(
    () =>
      participants?.find(
        (participant) => participant.conversation.id === match?.params.id
      ),
    [participants, match]
  )
  const people = useMemo(
    () =>
      participant?.conversation.participants.filter((userID) => userID !== id),
    [participant, id]
  )

  if (!participant) return <></>
  return (
    <Suspense fallback={<Chat.Placeholder />}>
      <Helmet>
        <title>Octii - Messages</title>
      </Helmet>
      <div
        className={styles.conversation}
        key={participant.conversation.channel_id}
      >
        <Chat.View
          type={
            (people?.length ?? 0) > 1
              ? InternalChannelTypes.GroupChannel
              : InternalChannelTypes.PrivateChannel
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

const ConversationProvider = () => {
  const { id, token } = Auth.useContainer()
  const [lastConversation] = useSuspenseStorageItem<string>('last-conversation')
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const { data: participants } = useQuery(
    ['participants', id, token],
    getParticipants
  )
  const history = useHistory()
  const isMobile = useMedia('(max-width: 740px)')
  const filteredParticipants = useMemo(
    () =>
      participants
        ?.filter((part) => part.conversation.participants.length > 1)
        .sort((a, b) => {
          const firstMessage = dayjs
            .utc(a.conversation.last_message_date ?? 0)
            .unix()
          const lastMessage = dayjs
            .utc(b.conversation.last_message_date ?? 0)
            .unix()
          if (lastMessage > firstMessage) return 1
          else if (lastMessage < firstMessage) return -1
          else return 0
        }) || [],
    [participants]
  )

  useEffect(() => {
    if (!match?.params.id && filteredParticipants.length > 0 && !isMobile) {
      history.push(
        `/conversations/${
          lastConversation &&
          filteredParticipants.find(
            (p) => p.conversation.id === lastConversation
          )
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
  }, [
    filteredParticipants,
    isMobile,
    lastConversation,
    match?.params.id,
    history
  ])

  return (
    <>
      {match &&
      participants?.find((p) => p.conversation.id === match.params.id) ? (
        <Permission.Provider>
          <ConversationView />
        </Permission.Provider>
      ) : isMobile ? (
        <>
          <Sidebar />
          <Conversations />
        </>
      ) : (
        <></>
      )}
    </>
  )
}

const Redirects = () => {
  const { id, token } = Auth.useContainer()
  const { path } = useRouteMatch()
  const { data: participants } = useQuery(
    ['participants', id, token],
    getParticipants
  )
  const filteredParticipants = useMemo(
    () =>
      participants
        ?.filter(({ conversation }: Participant) => {
          const people = conversation.participants.filter(
            (userID: string) => userID !== id
          )
          return people.length !== 0
        })
        .sort((a, b) => {
          const firstMessage = dayjs
            .utc(a.conversation.last_message_date ?? 0)
            .unix()
          const lastMessage = dayjs
            .utc(b.conversation.last_message_date ?? 0)
            .unix()
          if (lastMessage > firstMessage) return 1
          else if (lastMessage < firstMessage) return -1
          else return 0
        }),
    [participants, id]
  )

  const isMobile = useMedia('(max-width: 740px)')

  const location = useLocation()

  if (!filteredParticipants) return <></>

  if (filteredParticipants.length === 0)
    return <Redirect to={`${path}/empty`} />

  if (
    filteredParticipants.length > 0 &&
    !isMobile &&
    (location.pathname === path || location.pathname === `${path}/empty`)
  )
    return (
      <Redirect to={`${path}/${filteredParticipants?.[0].conversation.id}`} />
    )
  return <></>
}

const Nested = () => {
  const { path } = useRouteMatch()
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <>
      {!isMobile && <Conversations />}
      <Suspense fallback={<Chat.Placeholder />}>
        <Switch>
          <PrivateRoute
            path={`${path}/:id`}
            component={ConversationProvider}
            exact
          />
          {isMobile && (
            <PrivateRoute
              path={path}
              exact
              component={() => (
                <>
                  <Sidebar />
                  <Conversations />
                </>
              )}
            />
          )}
        </Switch>
      </Suspense>
    </>
  )
}

const ConversationRouter = () => {
  const { path } = useRouteMatch()
  const isMobile = useMedia('(max-width: 740px)')

  return (
    <>
      <Redirects />
      <Switch>
        <PrivateRoute
          component={() => (
            <>
              {isMobile && <Sidebar />}
              <Empty />
            </>
          )}
          path={`${path}/empty`}
        />
        <Nested />
      </Switch>
    </>
  )
}

export default ConversationRouter
