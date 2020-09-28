import React, { useState } from 'react'
import styles from './Conversations.module.scss'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ConversationCard } from './ConversationCard'
import Button from '../components/Button'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { UI } from '../uiStore'
import Loader from '../components/Loader'
import { useLocalStorage, useMedia } from 'react-use'

type ParticipantsResponse = {
  id: string
  conversation: {
    id: string
    channel_id: string
    participants: string[]
  }
}[]

const ConversationList = () => {
  const auth = Auth.useContainer()
  const ui = UI.useContainer()
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const [lastConversation, setLastConversation] = useLocalStorage(
    'last_conversation'
  )
  const isMobile = useMedia('(max-width: 800px)')
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
        participants.data?.map(
          ({
            conversation
          }: {
            conversation: {
              id: string
              channel_id: string
              participants: string[]
            }
          }) => {
            const people = conversation.participants.filter(
              (userID: string) => userID !== auth.id
            )
            if (people.length > 1) {
              console.warn('Group chats not implemented')
              return <></>
            } else if (people.length === 0) {
              console.warn('Empty chats not implemented')
              return <></>
            } else {
              return (
                <ConversationCard
                  selected={selected === conversation.id}
                  onClick={() => {
                    history.push(`/conversations/${conversation.id}`)
                    setSelected(conversation.id)
                    setLastConversation(conversation.id)
                  }}
                  key={conversation.id}
                  people={people}
                  conversationID={conversation.id}
                />
              )
            }
          }
        )
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
  const ui = UI.useContainer()
  return (
    <div className={styles.sidebar}>
      <h3>
        Conversations{' '}
        <span onClick={() => ui.setModal('newConversation')}>
          <FontAwesomeIcon icon={faPlus} />
        </span>
      </h3>
      <div className={styles.list}>
        <React.Suspense fallback={<Loader />}>
          <ConversationList />
        </React.Suspense>
      </div>
    </div>
  )
}
