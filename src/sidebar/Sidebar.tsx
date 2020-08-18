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
import { useHistory } from 'react-router-dom'

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
  const user = useQuery(['users', auth.id], async (key, userID) => (await clientGateway.get<UserResponse>(`/users/${userID}`, {
    headers: {
      Authorization: auth.token
    }
  })).data)
  const participants = useQuery('participants', async () => (await clientGateway.get<ParticipantsResponse>(`/users/${auth.id}/participants`, {
    headers: {
      Authorization: auth.token
    }
  })).data)
  const [invite, setInvite] = useState(false)
  const history = useHistory()
  return (
		<div className={styles.sidebar}>
      {invite && <NewConversation onDismiss={() => setInvite(false)}/>}
      <div className={styles.profile}>
        <img src={user.data?.avatar} alt={user.data?.username}/>
        <h4>{user.data?.username}#{user.data?.discriminator}</h4>
        <FontAwesomeIcon icon={faUserCog} fixedWidth/>
      </div>
      <h3>Recent <span onClick={() => setInvite(true)}><FontAwesomeIcon icon={faPlus}/></span></h3>
      <div className={styles.list}>
        {participants.data && participants.data.length > 0
          ? participants.data?.map(({ conversation }) => {
            const people = conversation.participants.filter((userID) => userID !== auth.id)
            console.log(people)
            if (people.length > 1) {
              console.warn('Group chats not implemented')
              return <></>
            } else {
              return <ConversationCard onClick={() => history.push(`/conversations/${conversation.id}`)}
                                       key={conversation.id} people={people}/>
            }
          })
          : (
            <div className={styles.alert}>
              <h3>You aren't in any chats!</h3>
              <p>Would you like to chat with someone?</p>
              <Button type='button' onClick={() => setInvite(true)}>Create One</Button>
            </div>
          )}
      </div>
		</div>
	)
}
