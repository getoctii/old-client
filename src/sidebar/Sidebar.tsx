import React, { useState } from 'react'
import styles from './Sidebar.module.scss'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'
import { faPlus, faUserCog } from '@fortawesome/pro-solid-svg-icons'
import NewConversation from './menus/NewConversation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ConversationCard } from './ConversationCard'
import Button from '../components/Button'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Settings from './menus/Settings'
import { UI } from '../uiStore'

type UserResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

type ParticipantsResponse = {
  id: string
  conversation: {
    id: string
    channel_id: string
    participants: string[]
  }
}[]

export const Sidebar = () => {
  const auth = Auth.useContainer()
  const ui = UI.useContainer()
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const user = useQuery(
    ['users', auth.id],
    async (key, userID) =>
      (
        await clientGateway.get<UserResponse>(`/users/${userID}`, {
          headers: {
            Authorization: auth.token
          }
        })
      ).data
  )
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
  return (
    <div className={styles.sidebar}>
      <div className={styles.profile}>
        <img src={user.data?.avatar} alt={user.data?.username} />
        <h4>
          {user.data?.username}#{user.data?.discriminator.toString().padStart(4, '0')}
        </h4>
        {/* <FontAwesomeIcon icon={faUserCog} fixedWidth/> */}
      </div>
      <h3>
        Recent{' '}
        <span onClick={() => ui.setModal('newConversation')}>
          <FontAwesomeIcon icon={faPlus} />
        </span>
      </h3>
      <div className={styles.list}>
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
              } else {
                return (
                  <ConversationCard
                    selected={selected === conversation.id}
                    onClick={() => {
                      history.push(`/conversations/${conversation.id}`)
                      setSelected(conversation.id)
                    }}
                    key={conversation.id}
                    people={people}
                  />
                )
              }
            }
          )
        ) : (
          <div className={styles.alert}>
            <h3>You aren't in any chats!</h3>
            <p>Would you like to chat with someone?</p>
            <Button
              type="button"
              onClick={() => ui.setModal('newConversation')}
            >
              Create One
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
