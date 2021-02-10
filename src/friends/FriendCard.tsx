import React from 'react'
import styles from './FriendCard.module.scss'
import { queryCache, useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserTimes, faUserCheck } from '@fortawesome/pro-duotone-svg-icons'
import Icon from '../user/Icon'
import { getUser } from '../user/remote'
import { RelationshipResponse, RelationshipTypes } from './remote'
import { clientGateway } from '../utils/constants'

const FriendCard = ({ user_id, recipient_id, type }: RelationshipResponse) => {
  const { token, id } = Auth.useContainer()
  const { data: user } = useQuery(['users', user_id, token], getUser)
  const { data: recipient } = useQuery(['users', recipient_id, token], getUser)
  return (
    <div className={styles.card}>
      <Icon
        avatar={id === user_id ? recipient?.avatar : user?.avatar}
        state={id === user_id ? recipient?.state : user?.state}
      />
      <h4>
        {id === user_id ? recipient?.username : user?.username}#
        {id === user_id
          ? recipient?.discriminator === 0
            ? 'inn'
            : recipient?.discriminator.toString().padStart(4, '0')
          : user?.discriminator === 0
          ? 'inn'
          : user?.discriminator.toString().padStart(4, '0')}
      </h4>
      <div className={styles.buttons}>
        {type === RelationshipTypes.INCOMING_FRIEND_REQUEST && (
          <>
            <FontAwesomeIcon
              className={styles.primary}
              icon={faUserCheck}
              fixedWidth
              onClick={async () => {
                await clientGateway.post(
                  `/relationships/${user_id}`,
                  {},
                  {
                    headers: {
                      Authorization: token
                    }
                  }
                )
                queryCache.setQueryData<RelationshipResponse[]>(
                  ['relationships', id, token],
                  (initial) => {
                    if (initial) {
                      return initial.map((fr) =>
                        fr.user_id === user_id
                          ? { ...fr, type: RelationshipTypes.FRIEND }
                          : fr
                      )
                    } else {
                      return [
                        {
                          user_id,
                          recipient_id,
                          type: RelationshipTypes.FRIEND
                        }
                      ]
                    }
                  }
                )
              }}
            />
            <FontAwesomeIcon
              className={styles.danger}
              icon={faUserTimes}
              fixedWidth
              onClick={async () => {
                await clientGateway.delete(`/relationships/${user_id}`, {
                  headers: {
                    Authorization: token
                  }
                })
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default FriendCard
