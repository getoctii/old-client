import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'
import styles from './ConversationCard.module.scss'
import { Auth } from '../authentication/state'

type UserResponse = {
  avatar: string
  username: string
  discriminator: number
}

export const ConversationCard = ({
  people,
  onClick,
  selected
}: {
  people: string[]
  selected?: boolean
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}) => {
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
  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <img src={recipient.data?.avatar} alt={recipient.data?.username} />
      <h4>
        {recipient.data?.username}#{recipient.data?.discriminator}
      </h4>
      <FontAwesomeIcon icon={faChevronRight} fixedWidth />
    </div>
  )
}
