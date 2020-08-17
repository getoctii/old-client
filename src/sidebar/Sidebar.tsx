import React, { useState } from 'react'
import styles from './Sidebar.module.scss'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'
import { faPlusCircle, faChevronRight, faUserCog } from '@fortawesome/pro-solid-svg-icons'
import Invite from './menus/Invite'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ConversationCard } from './ConversationCard'
import Button from '../components/Button'

type UserResponse = {
  avatar: string
  username: string
  discriminator: number
}

type ParticipantsResponse = {
  id: string
  conversation: {
    id: string
    participants: string[]
  }
}[]

export const Sidebar = () => {
  const auth = Auth.useContainer()
  console.log(auth.id)
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
  
  console.log(participants)
  return (
		<div className={styles.sidebar}>
      {invite && <Invite onDismiss={() => setInvite(false)}/>}
      <div className={styles.profile}>
        <img src={user.data?.avatar} alt={user.data?.username} />
        <h4>{user.data?.username}#{user.data?.discriminator}</h4>
        <FontAwesomeIcon icon={faUserCog} fixedWidth />
      </div>
      <h3>Recents</h3>
      <div className={styles.list}>
        {participants.data && participants.data.length > 0
          ? participants.data?.map(({ conversation }) => {
              const people = conversation.participants.filter((userID) => userID !== auth.id)
              if (people.length > 1) {
                console.warn('Group chats not implemented')
                return <></>
              } else {
                return <ConversationCard people={people} />
              }
            })
          : (
            <div className={styles.alert}>
              <h3>You aren't in any chats!</h3>
              <p>Would you like to chat with someone?</p>
              <Button onClick={() => setInvite(true)}>Create One</Button>
            </div>
          )}
      </div>
		</div>
	)
}
