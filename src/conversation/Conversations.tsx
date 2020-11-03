import React, { useEffect, useState } from 'react'
import styles from './Conversations.module.scss'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'
import { ConversationCard } from './ConversationCard'
import Button from '../components/Button'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { UI } from '../state/ui'
import Loader from '../components/Loader'
import { useLocalStorage, useMedia } from 'react-use'
import NewConversation from './NewConversation'

type Participant = {
  id: string
  conversation: {
    id: string
    channel_id: string
    participants: string[]
  }
}

type ParticipantsResponse = Participant[]

const ConversationList = () => {
  const auth = Auth.useContainer()
  const ui = UI.useContainer()
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const [lastConversation, setLastConversation] = useLocalStorage(
    'last_conversation'
  )
  const isMobile = useMedia('(max-width: 940px)')
  const participants = useQuery(
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
  const [selected, setSelected] = useState(match?.params.id || undefined)
  const history = useHistory()
  const filteredParticipants = participants.data?.filter(
    (part) => part.conversation.participants.length > 1
  )

  useEffect(() => {
    setSelected(match?.params.id || undefined)
  }, [match])

  if (
    !selected &&
    filteredParticipants &&
    filteredParticipants.length > 0 &&
    !isMobile
  ) {
    history.push(
      `/conversations/${
        lastConversation &&
        filteredParticipants.find((p) => p.conversation.id === lastConversation)
          ? lastConversation
          : filteredParticipants[0].conversation.id
      }`
    )
  }
  return (
    <>
      {participants.data && participants.data.length > 0 ? (
        participants.data
          ?.filter(({ conversation }: Participant) => {
            const people = conversation.participants.filter(
              (userID: string) => userID !== auth.id
            )
            return people.length > 1 || people.length !== 0
          })
          .map(({ conversation }: Participant, index) => {
            const people = conversation.participants.filter(
              (userID: string) => userID !== auth.id
            )
            if (people.length > 1 || people.length === 0) {
              return
            } else {
              return (
                <div key={conversation.id}>
                  {index !== 0 && (
                    <hr
                      className={
                        selected === conversation.id ? styles.hidden : ''
                      }
                    />
                  )}
                  <ConversationCard
                    selected={selected === conversation.id}
                    onClick={() => {
                      history.push(`/conversations/${conversation.id}`)
                      setSelected(conversation.id)
                      setLastConversation(conversation.id)
                    }}
                    people={people}
                    conversationID={conversation.id}
                  />
                </div>
              )
            }
          })
      ) : (
        <div className={styles.alert}>
          <h3>You aren't in any chats!</h3>
          <p>Would you like to chat with someone?</p>
          <Button type='button' onClick={() => ui.setModal('newConversation')}>
            Create One
          </Button>
        </div>
      )}
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
        <React.Suspense fallback={<Loader />}>
          <ConversationList />
        </React.Suspense>
      </div>
    </div>
  )
}
