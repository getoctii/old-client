import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  Suspense
} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronRight,
  faCopy,
  faTrashAlt
} from '@fortawesome/pro-solid-svg-icons'
import { useQuery, useMutation, queryCache } from 'react-query'
import { clientGateway } from '../utils/constants'
import styles from './ConversationCard.module.scss'
import { Auth } from '../authentication/state'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { getMentions, getUnreads, getUser, State } from '../user/remote'
import { getMessage } from '../message/remote'
import { getChannel } from '../chat/remote'
import { Clipboard } from '@capacitor/core'
import { faGlasses } from '@fortawesome/free-solid-svg-icons'
import Context from '../components/Context'
import { ContextMenuItems } from '../state/ui'
import useMarkdown from '@innatical/markdown'
import { ErrorBoundary } from 'react-error-boundary'
import Message from '../chat/Message'

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
  const unreads = useQuery(['unreads', id, token], getUnreads)
  const mentions = useQuery(['mentions', id, token], getMentions)

  const mentionsCount = useMemo(
    () => mentions.data?.[channelID]?.filter((mention) => !mention.read).length,
    [mentions, channelID]
  )

  const getItems = useCallback(() => {
    const items: ContextMenuItems = [
      {
        text: 'Copy ID',
        icon: faCopy,
        danger: false,
        onClick: () => {
          Clipboard.write({
            string: conversationID
          })
        }
      }
    ]

    if (
      unreads?.data?.[channelID]?.last_message_id !==
      unreads?.data?.[channelID]?.read
    ) {
      items.push({
        text: 'Mark as Read',
        icon: faGlasses,
        danger: false,
        onClick: async () => {
          if (!channel.data) return
          const id = channel.data.id

          await clientGateway.post(
            `/channels/${id}/read`,
            {},
            {
              headers: {
                Authorization: token
              }
            }
          )
          // TODO: Maybe we want to push a gateway event instead?
          queryCache.setQueryData(['unreads', id, token], (initial: any) => ({
            ...initial,
            [id]: {
              ...initial[id],
              read: initial[id].last_message_id
            }
          }))
        }
      })
    }

    items.push({
      text: 'Delete Conversation',
      icon: faTrashAlt,
      danger: true,
      onClick: (event) => {
        if (match?.params.id === conversationID) history.push('/')
        event.stopPropagation()
        leaveConversation()
      }
    })
    return items
  }, [
    channel,
    conversationID,
    history,
    leaveConversation,
    match?.params.id,
    token,
    unreads.data,
    channelID
  ])

  const output = useMarkdown(message?.content || '', {
    bold: (str, key) => <strong key={key}>{str}</strong>,
    italic: (str, key) => <i key={key}>{str}</i>,
    underlined: (str, key) => <u key={key}>{str}</u>,
    strikethough: (str, key) => <del key={key}>{str}</del>,
    link: (str, key) => {
      return (
        <span key={key} className={styles.link}>
          {str}
        </span>
      )
    },
    codeblock: (str, key) => <code key={key}>{str}</code>,
    custom: [
      [
        /<@([A-Za-z0-9-]+?)>/g,
        (str, key) => (
          <Suspense fallback={<>&lt;@{str}&gt;</>}>
            <ErrorBoundary fallbackRender={() => <>&lt;@{str}&gt;</>}>
              <Message.Mention selected={selected} key={key} userID={str} />
            </ErrorBoundary>
          </Suspense>
        )
      ]
    ]
  })

  return (
    <Context.Wrapper key={conversationID} items={getItems()}>
      <div
        className={`${styles.card} ${selected ? styles.selected : ''}`}
        onClick={onClick}
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
            {output}
          </p>
        </div>
        <div className={styles.details}>
          {!selected &&
            (mentionsCount && mentionsCount > 0 ? (
              <div
                className={`${styles.mention} ${
                  mentionsCount > 9 ? styles.pill : ''
                }`}
              >
                <span>{mentionsCount > 999 ? '999+' : mentionsCount}</span>
              </div>
            ) : unreads?.data?.[channelID]?.last_message_id !==
              unreads?.data?.[channelID]?.read ? (
              <div className={styles.unread} />
            ) : (
              <></>
            ))}
          <FontAwesomeIcon icon={faChevronRight} fixedWidth />
        </div>
      </div>
    </Context.Wrapper>
  )
}

const Placeholder = () => {
  const username = useMemo(() => Math.floor(Math.random() * 5) + 3, [])
  const status = useMemo(() => Math.floor(Math.random() * 6) + 3, [])
  return (
    <div className={styles.placeholder}>
      <div className={styles.avatar} />
      <div className={styles.user}>
        <div className={styles.username} style={{ width: `${username}rem` }} />
        <div className={styles.status} style={{ width: `${status}rem` }} />
      </div>
    </div>
  )
}

const ConversationCard = { View, Placeholder }

export default ConversationCard
