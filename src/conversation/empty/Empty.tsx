import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useMemo } from 'react'
import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import {
  getRelationships,
  RelationshipResponse,
  RelationshipTypes
} from '../../hub/friends/remote'
import Icon from '../../user/Icon'
import { getUser } from '../../user/remote'
import NewConversation from '../NewConversation'
import { createConversation } from '../remote'
import styles from './Empty.module.scss'
import { faPlusCircle } from '@fortawesome/pro-duotone-svg-icons'

const FriendSuggestion: FC<RelationshipResponse & { onClick: () => void }> = ({
  recipient_id,
  user_id,
  onClick
}) => {
  const { id, token } = Auth.useContainer()
  const { data: user } = useQuery(['users', user_id, token], getUser)
  const { data: recipient } = useQuery(['users', recipient_id, token], getUser)
  return (
    <div className={styles.friendSuggestion} onClick={onClick}>
      <Icon
        avatar={id === user_id ? recipient?.avatar : user?.avatar}
        state={id === user_id ? recipient?.state : user?.state}
      />
      <div>
        <h4>{id === user_id ? recipient?.username : user?.username}</h4>
        <p>{id === user_id ? recipient?.status : user?.status}</p>
      </div>
      <FontAwesomeIcon className={styles.chrevron} icon={faPlusCircle} />
    </div>
  )
}

const Empty: FC = () => {
  const { id, token } = Auth.useContainer()
  const history = useHistory()
  const { data: relationships } = useQuery(
    ['relationships', id, token],
    getRelationships
  )
  const friends = useMemo(
    () =>
      relationships?.filter(
        (relationship) => relationship.type === RelationshipTypes.FRIEND
      ) ?? [],
    [relationships]
  )
  return (
    <div className={styles.container}>
      {friends.length > 0 ? (
        <div className={styles.hasFriends}>
          <h1>Messages</h1>
          <p>Use the search bar to start new chats with friends!</p>
          <NewConversation />
          <br />

          <div className={styles.friends}>
            <h3>Suggestions</h3>
            {friends.map((friend, index) => (
              <>
                {index !== 0 && <hr />}
                <FriendSuggestion
                  onClick={async () => {
                    const result = await createConversation(token!, {
                      recipient:
                        id === friend.user_id
                          ? friend.recipient_id
                          : friend.user_id
                    })
                    if (result.id) history.push(`/conversations/${result.id}`)
                  }}
                  key={friend.recipient_id}
                  {...friend}
                />
              </>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.noFriends}>
          <h3>Looks like you don't have friends to chat with...</h3>
          <Button type='button' onClick={() => history.push('/friends')}>
            Let's add some!
          </Button>
        </div>
      )}
    </div>
  )
}

export default Empty
