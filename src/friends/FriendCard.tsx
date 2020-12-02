import React from 'react'
import styles from './FriendCard.module.scss'
import { useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { clientGateway } from '../utils/constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserTimes, faUserCheck } from '@fortawesome/pro-solid-svg-icons'

type UserResponse = {
  avatar: string
  username: string
  discriminator: number
}

const FriendCard = ({ id, pending }: { id: string; pending: boolean }) => {
  const { token } = Auth.useContainer()
  const { data } = useQuery(
    ['users', id],
    async (key, userID) =>
      (
        await clientGateway.get<UserResponse>(`/users/${userID}`, {
          headers: { Authorization: token }
        })
      ).data
  )
  return (
    <div className={styles.card}>
      <img src={data?.avatar} alt={data?.username} />
      <h4>{data?.username}</h4>
      <div className={styles.buttons}>
        {pending && (
          <FontAwesomeIcon className={styles.primary} icon={faUserCheck} />
        )}
        <FontAwesomeIcon className={styles.danger} icon={faUserTimes} />
      </div>
    </div>
  )
}

export default FriendCard
