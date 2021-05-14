import { FC } from 'react'
import styles from './FriendCard.module.scss'
import { Auth } from '../../authentication/state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserTimes, faUserCheck } from '@fortawesome/pro-duotone-svg-icons'
import Icon from '../../user/Icon'
import { RelationshipResponse, RelationshipTypes } from './remote'
import { useUser } from '../../user/state'
import { Relationships } from '../../friends/relationships'

const FriendCardView: FC<RelationshipResponse> = ({
  user_id,
  recipient_id,
  type
}) => {
  const { id } = Auth.useContainer()
  const user = useUser(user_id)
  const recipient = useUser(recipient_id)
  const {
    newRelationship,
    deleteRelationship
  } = Relationships.useContainerSelector(
    ({ newRelationship, deleteRelationship }) => ({
      newRelationship,
      deleteRelationship
    })
  )
  return (
    <div className={styles.card}>
      <Icon
        className={styles.icon}
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
      <div className={styles.details}>
        {type === RelationshipTypes.INCOMING_FRIEND_REQUEST ? (
          <>
            <FontAwesomeIcon
              className={styles.primary}
              icon={faUserCheck}
              fixedWidth
              onClick={async () => {
                await newRelationship(user_id === id ? recipient_id : user_id)
              }}
            />
            <FontAwesomeIcon
              className={styles.danger}
              icon={faUserTimes}
              fixedWidth
              onClick={async () => {
                await deleteRelationship(
                  user_id === id ? recipient_id : user_id
                )
              }}
            />
          </>
        ) : type === RelationshipTypes.FRIEND ||
          type === RelationshipTypes.OUTGOING_FRIEND_REQUEST ? (
          <FontAwesomeIcon
            className={styles.danger}
            icon={faUserTimes}
            fixedWidth
            onClick={async () => {
              await deleteRelationship(user_id === id ? recipient_id : user_id)
            }}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

const FriendCardPlaceholder: FC = () => {
  return (
    <div className={styles.friendPlaceholder}>
      <div className={styles.icon} />
      <div className={styles.tag} />
    </div>
  )
}

const FriendCard = { View: FriendCardView, Placeholder: FriendCardPlaceholder }

export default FriendCard
