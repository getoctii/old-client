import React, { Suspense, useMemo } from 'react'
import styles from './Conversations.module.scss'
import { Auth } from '../authentication/state'
import { queryCache, useQuery } from 'react-query'
import ConversationCard from './ConversationCard'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useLocalStorage, useMedia, useUpdate } from 'react-use'
import NewConversation from './NewConversation'
import { MessageResponse } from '../message/remote'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import { getParticipants, Participant } from '../user/remote'

dayjs.extend(dayjsUTC)

const ConversationList = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const participants = useQuery(
    ['participants', auth.id, auth.token],
    getParticipants
  )
  const history = useHistory()
  const filteredParticipants = participants.data?.filter(
    (part) => part.conversation.participants.length > 1
  )
  const [, setLastConversation] = useLocalStorage('last_conversation')

  const update = useUpdate()
  return (
    <>
      {filteredParticipants && filteredParticipants.length > 0 ? (
        filteredParticipants
          ?.filter(({ conversation }: Participant) => {
            const people = conversation.participants.filter(
              (userID: string) => userID !== auth.id
            )
            return people.length > 1 || people.length !== 0
          })
          .sort((a, b) => {
            const firstMessage = dayjs
              .utc(
                (queryCache.getQueryData([
                  'message',
                  a.conversation.last_message_id,
                  auth.token
                ]) as MessageResponse | undefined)?.created_at ?? 0
              )
              .unix()
            const lastMessage = dayjs
              .utc(
                (queryCache.getQueryData([
                  'message',
                  b.conversation.last_message_id,
                  auth.token
                ]) as MessageResponse | undefined)?.created_at ?? 0
              )
              .unix()
            if (lastMessage > firstMessage) return 1
            else if (lastMessage < firstMessage) return -1
            else return 0
          })
          .map(({ conversation }: Participant, index) => {
            const people = conversation.participants.filter(
              (userID: string) => userID !== auth.id
            )
            if (people.length > 1 || people.length === 0) {
              return <></>
            } else {
              return (
                <div key={conversation.id}>
                  {index !== 0 && (
                    <hr
                      className={
                        match?.params.id === conversation.id
                          ? styles.hidden
                          : ''
                      }
                    />
                  )}
                  <Suspense fallback={<ConversationCard.Placeholder />}>
                    <ConversationCard.View
                      selected={match?.params.id === conversation.id}
                      onClick={() => {
                        history.push(`/conversations/${conversation.id}`)
                        setLastConversation(conversation.id)
                      }}
                      people={people}
                      conversationID={conversation.id}
                      lastMessageID={conversation.last_message_id}
                      messageUpdated={update}
                      channelID={conversation.channel_id}
                    />
                  </Suspense>
                </div>
              )
            }
          })
      ) : (
        <div className={styles.alert}>
          <h4>You aren't in any chats!</h4>
          <p>Use the search bar to create new chats using usernames.</p>
        </div>
      )}
    </>
  )
}

const Placeholder = () => {
  const length = useMemo(() => Math.floor(Math.random() * 10) + 1, [])
  return (
    <>
      {Array.from(Array(length).keys()).map((_, index) => (
        <>
          {index !== 0 && <hr />}
          <ConversationCard.Placeholder key={index} />
        </>
      ))}
    </>
  )
}

export const Conversations = () => {
  const isMobile = useMedia('(max-width: 940px)')
  return (
    <div className={styles.sidebar}>
      {isMobile && <div className={styles.statusBar} />}
      <h3>Messages</h3>
      <NewConversation />
      <div className={styles.list}>
        <React.Suspense fallback={<Placeholder />}>
          <ConversationList />
        </React.Suspense>
      </div>
    </div>
  )
}
