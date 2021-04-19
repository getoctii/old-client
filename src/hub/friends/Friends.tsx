import { FC, Suspense, useMemo, useState } from 'react'
import styles from './Friends.module.scss'
import FriendCard from './FriendCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserClock } from '@fortawesome/pro-duotone-svg-icons'
import { useQuery } from 'react-query'
import { Auth } from '../../authentication/state'
import { RelationshipTypes, getRelationships } from './remote'
import EmptyFriends from './EmptyFriends'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { UI } from '../../state/ui'
import { ModalTypes } from '../../utils/constants'

const Friends: FC = () => {
  const ui = UI.useContainer()
  const { id, token } = Auth.useContainer()
  const { data: relationships } = useQuery(
    ['relationships', id, token],
    getRelationships
  )
  const incoming = useMemo(
    () =>
      relationships?.filter(
        (relationship) =>
          relationship.type === RelationshipTypes.INCOMING_FRIEND_REQUEST
      ),
    [relationships]
  )
  const outgoing = useMemo(
    () =>
      relationships?.filter(
        (relationship) =>
          relationship.type === RelationshipTypes.OUTGOING_FRIEND_REQUEST
      ),
    [relationships]
  )
  const friends = useMemo(
    () =>
      relationships?.filter(
        (relationship) => relationship.type === RelationshipTypes.FRIEND
      ),
    [relationships]
  )
  const [showIncoming, setShowIncoming] = useState(false)
  const [showOutgoing, setShowOutgoing] = useState(false)

  return (
    <>
      <div className={styles.friends}>
        <h4>
          Friends{' '}
          <span>
            <FontAwesomeIcon
              className={styles.add}
              icon={faPlus}
              onClick={() => ui.setModal({ name: ModalTypes.ADD_FRIEND })}
            />
          </span>
        </h4>
        {(outgoing?.length ?? 0) > 0 && (
          <div className={styles.incoming}>
            <div
              className={styles.dropdown}
              onClick={() => setShowOutgoing(!showOutgoing)}
            >
              <FontAwesomeIcon icon={faUserClock} /> Outgoing{' '}
              <span>{outgoing?.length}</span>
            </div>
            <div className={styles.cards}>
              {showOutgoing &&
                outgoing?.map((friend) => (
                  <Suspense
                    key={
                      friend.recipient_id === id
                        ? friend.user_id
                        : friend.recipient_id
                    }
                    fallback={<FriendCard.Placeholder />}
                  >
                    <FriendCard.View {...friend} />
                  </Suspense>
                ))}
            </div>
            <br />
          </div>
        )}
        {(incoming?.length ?? 0) > 0 && (
          <div className={styles.incoming}>
            <div
              className={styles.dropdown}
              onClick={() => setShowIncoming(!showIncoming)}
            >
              <FontAwesomeIcon icon={faUserClock} /> Incoming{' '}
              <span>{incoming?.length}</span>
            </div>
            {showIncoming && (
              <div className={styles.cards}>
                {incoming?.map((friend) => (
                  <Suspense
                    key={
                      friend.recipient_id === id
                        ? friend.user_id
                        : friend.recipient_id
                    }
                    fallback={<FriendCard.Placeholder />}
                  >
                    <FriendCard.View {...friend} />
                  </Suspense>
                ))}
              </div>
            )}
            <br />
          </div>
        )}
        <div className={styles.list}>
          {(friends?.length ?? 0) > 0 ? (
            friends?.map((friend, index) => (
              <>
                {index !== 0 && <hr />}
                <Suspense
                  key={
                    friend.recipient_id === id
                      ? friend.user_id
                      : friend.recipient_id
                  }
                  fallback={<FriendCard.Placeholder />}
                >
                  <FriendCard.View {...friend} />
                </Suspense>
              </>
            ))
          ) : (
            <EmptyFriends />
          )}
        </div>
      </div>
    </>
  )
}

export default Friends
