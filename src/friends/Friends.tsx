import React, { useMemo, useState } from 'react'
import styles from './Friends.module.scss'
import FriendCard from './FriendCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserClock } from '@fortawesome/pro-duotone-svg-icons'
import { useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { RelationshipTypes, getRelationships } from './remote'
import EmptyFriends from './EmptyFriends'

const Friends = () => {
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
    <div className={styles.friends}>
      <h1>Friends</h1>
      {(incoming?.length ?? 0) > 0 && (
        <div className={styles.incoming}>
          <div
            className={styles.card}
            onClick={() => setShowIncoming(!showIncoming)}
          >
            <FontAwesomeIcon icon={faUserClock} /> Incoming{' '}
            <span>{incoming?.length}</span>
          </div>
          <div className={styles.cards}>
            {showIncoming &&
              incoming?.map((friend) => <FriendCard {...friend} />)}
          </div>
          <br />
        </div>
      )}
      <div>
        {(friends?.length ?? 0) > 0 ? (
          friends?.map((friend) => <FriendCard {...friend} />)
        ) : (
          <EmptyFriends />
        )}
      </div>
      <br />
      {(outgoing?.length ?? 0) > 0 && (
        <>
          <br />
          <div className={styles.card}>
            Outgoing <FontAwesomeIcon icon={faUserClock} />
          </div>
          {showOutgoing &&
            outgoing?.map((friend) => <FriendCard {...friend} />)}
        </>
      )}
    </div>
  )
}

export default Friends
