import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import { useQuery, useMutation } from 'react-query'
import { clientGateway } from '../constants'
import styles from './ConversationCard.module.scss'
import { Auth } from '../authentication/state'
import { useHistory, useRouteMatch } from 'react-router-dom'

type UserResponse = {
  avatar: string
  username: string
  discriminator: number
}

export const ConversationCard = ({
  people,
  onClick,
  selected,
  conversationID
}: {
  people: string[]
  selected?: boolean
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
  conversationID: string
}) => {
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const history = useHistory()
  const [hoverDelete, setHoverDelete] = useState(false)
  const { token } = Auth.useContainer()
  const recipient = useQuery(
    ['users', people[0]],
    async (key, userID) =>
      (
        await clientGateway.get<UserResponse>(`/users/${userID}`, {
          headers: { Authorization: token }
        })
      ).data
  )
  const [leaveConversation] = useMutation(async () => await clientGateway.delete(`/conversations/${conversationID}`, {
    headers: { Authorization: token }
  }))
  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      onMouseEnter={() => setHoverDelete(true)}
      onMouseLeave={() => setHoverDelete(false)}
    >
      
      <img src={recipient.data?.avatar} alt={recipient.data?.username} />
      <h4>
        {recipient.data?.username}
      </h4>
      {hoverDelete ? <FontAwesomeIcon className={styles.leave} icon={faTimesCircle} onClick={(event) => {
        if (match?.params.id === conversationID) history.push('/')
        event.stopPropagation()
        leaveConversation()
      }} fixedWidth /> : <FontAwesomeIcon icon={faChevronRight} fixedWidth />}
    </div>
  )
}
