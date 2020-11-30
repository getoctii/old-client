import React, { useMemo, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import { useQuery, useMutation } from 'react-query'
import { clientGateway } from '../utils/constants'
import styles from './ConversationCard.module.scss'
import { Auth } from '../authentication/state'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { getUser, State } from '../user/remote'
import { getMessage } from '../message/remote'
import { getChannel } from '../chat/remote'

const View = ({
  people,
  onClick,
  selected,
  conversationID,
  lastMessageID,
  channelID,
  messageUpdated
}: {
  people: string[]
  selected?: boolean
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  conversationID: string
  lastMessageID?: string
  channelID: string
  messageUpdated: () => void
}) => {
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const history = useHistory()
  const [hoverDelete, setHoverDelete] = useState(false)
  const { token, id } = Auth.useContainer()
  const recipient = useQuery(['users', people[0], token], getUser)
  const channel = useQuery(['channel', channelID, token], getChannel)
  const [leaveConversation] = useMutation(
    async () =>
      await clientGateway.delete(`/conversations/${conversationID}`, {
        headers: { Authorization: token }
      })
  )
  const { data: message } = useQuery(
    ['message', lastMessageID, token],
    getMessage
  )

  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!ready && message) {
      messageUpdated()
      setReady(true)
    }
  }, [message, messageUpdated, ready])

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      onMouseEnter={() => setHoverDelete(true)}
      onMouseLeave={() => setHoverDelete(false)}
    >
      <div className={styles.avatar}>
        <img src={recipient.data?.avatar} alt={recipient.data?.username} />
        {recipient.data?.state && (
          <div
            className={`${styles.badge} ${
              recipient.data.state === State.online
                ? styles.online
                : recipient.data.state === State.dnd
                ? styles.dnd
                : recipient.data.state === State.idle
                ? styles.idle
                : recipient.data.state === State.offline
                ? styles.offline
                : ''
            } ${selected ? styles.selectedBadge : ''}`}
          />
        )}
      </div>
      <div className={styles.user}>
        <h4>{recipient.data?.username}</h4>
        <p>
          {message?.author_id === id ? 'You: ' : ''}
          {message?.content}
        </p>
      </div>
      {/* also dont wanna show this when you have the card selected somehow */}
      <div className={styles.details}>
        {!selected &&
        channel.data &&
        channel.data.last_message_id !== channel.data.read ? (
          <div className={styles.unread} />
        ) : (
          <></>
        )}
        <AnimatePresence>
          {hoverDelete ? (
            <FontAwesomeIcon
              className={styles.leave}
              icon={faTimesCircle}
              onClick={(event) => {
                if (match?.params.id === conversationID) history.push('/')
                event.stopPropagation()
                leaveConversation()
              }}
              fixedWidth
            />
          ) : (
            <FontAwesomeIcon icon={faChevronRight} fixedWidth />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const Placeholder = () => {
  const username = useMemo(() => Math.floor(Math.random() * 5) + 3, [])
  const status = useMemo(() => Math.floor(Math.random() * 6) + 3, [])
  return (
    <div className={styles.placeholder}>
      <div className={styles.avatar}></div>
      <div className={styles.user}>
        <div className={styles.username} style={{ width: `${username}rem` }} />
        <div className={styles.status} style={{ width: `${status}rem` }} />
      </div>
    </div>
  )
}

const ConversationCard = { View, Placeholder }

export default ConversationCard
