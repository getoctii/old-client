import React, { useMemo, useCallback, Suspense } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronRight,
  faCopy,
  faHouseLeave,
  faTrashAlt,
  faUserFriends
} from '@fortawesome/pro-solid-svg-icons'
import { useQuery, useMutation, queryCache } from 'react-query'
import { clientGateway, MessageTypes } from '../utils/constants'
import styles from './ConversationCard.module.scss'
import { Auth } from '../authentication/state'
import { useHistory, useRouteMatch } from 'react-router-dom'
import {
  fetchManyUsers,
  getMentions,
  getUnreads,
  Mentions,
  State
} from '../user/remote'
import { getMessage } from '../message/remote'
import { getChannel } from '../chat/remote'
import { Clipboard } from '@capacitor/core'
import { faGlasses } from '@fortawesome/free-solid-svg-icons'
import Context from '../components/Context'
import { ContextMenuItems } from '../state/ui'
import useMarkdown from '@innatical/markdown'
import { ErrorBoundary } from 'react-error-boundary'
import Mention from '../chat/Mention'

const ConversationCardView = ({
  people,
  onClick,
  selected,
  conversationID,
  lastMessageID,
  channelID
}: {
  people: string[]
  selected?: boolean
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  conversationID: string
  lastMessageID?: string
  channelID: string
}) => {
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const history = useHistory()
  const { token, id } = Auth.useContainer()
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
        onClick: async () => {
          await Clipboard.write({
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
          const channelId = channel.data.id

          await clientGateway.post(
            `/channels/${channelId}/read`,
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
            [channelId]: {
              ...initial[channelId],
              read: initial[channelId].last_message_id
            }
          }))

          const initialMentions = queryCache.getQueryData<Mentions>([
            'mentions',
            id,
            token
          ])

          if (initialMentions) {
            queryCache.setQueryData(['mentions', id, token], {
              ...initialMentions,
              [channelId]: initialMentions[channelId]?.map((m) => ({
                ...m,
                read: true
              }))
            })
          }
        }
      })
    }

    items.push({
      text:
        (people?.length ?? 1) === 1
          ? 'Delete Conversation'
          : 'Leave Conversation',
      icon: (people?.length ?? 1) === 1 ? faTrashAlt : faHouseLeave,
      danger: true,
      onClick: (event) => {
        if (match?.params.id === conversationID) history.push('/')
        event?.stopPropagation()
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
    channelID,
    id,
    people?.length
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
          <Suspense fallback={<div key={key}>&lt;@{str}&gt;</div>}>
            <ErrorBoundary
              fallbackRender={() => <div key={key}>&lt;@{str}&gt;</div>}
            >
              <Mention.User selected={selected} key={key} userID={str} />
            </ErrorBoundary>
          </Suspense>
        )
      ],
      [
        /<#([A-Za-z0-9-]+?)>/g,
        (str, key) => (
          <Suspense fallback={<div key={key}>&lt;@{str}&gt;</div>}>
            <ErrorBoundary
              fallbackRender={() => <div key={key}>&lt;@{str}&gt;</div>}
            >
              <Mention.Channel selected={selected} key={key} channelID={str} />
            </ErrorBoundary>
          </Suspense>
        )
      ]
    ]
  })

  const { data: users } = useQuery(['users', people, token], fetchManyUsers)
  return (
    <Context.Wrapper
      title={users?.map((user) => user.username).join(', ') || ''}
      message={(people?.length ?? 1) === 1 ? users?.[0]?.status : 'Group Chat'}
      items={getItems()}
    >
      <div
        className={`${styles.card} ${selected ? styles.selected : ''}`}
        onClick={onClick}
      >
        <div className={styles.avatar} key='avatar'>
          {(people?.length ?? 1) === 1 ? (
            <>
              <img src={users?.[0].avatar} alt={users?.[0].username} />
              {users?.[0].state && (
                <div
                  className={`${styles.badge} ${
                    users?.[0].state === State.online
                      ? styles.online
                      : users?.[0].state === State.dnd
                      ? styles.dnd
                      : users?.[0].state === State.idle
                      ? styles.idle
                      : users?.[0].state === State.offline
                      ? styles.offline
                      : ''
                  } ${selected ? styles.selectedBadge : ''}`}
                />
              )}
            </>
          ) : (
            <div className={styles.groupIcon}>
              <FontAwesomeIcon icon={faUserFriends} />
            </div>
          )}
        </div>
        <div className={styles.user} key='user'>
          <h4>{users?.map((user) => user.username).join(', ')}</h4>
          {message?.content && (
            <p>
              {message?.author_id === id
                ? 'You: '
                : (people?.length ?? 1) === 1
                ? ''
                : message.type === MessageTypes.NORMAL
                ? `${
                    users?.find((user) => user.id === message?.author_id)
                      ?.username ?? 'Unknown'
                  }: `
                : ''}
              {output}
            </p>
          )}
        </div>
        <div className={styles.details} key='details'>
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

const ConversationCardPlaceholder = () => {
  const username = useMemo(() => Math.floor(Math.random() * 5) + 3, [])
  const status = useMemo(() => Math.floor(Math.random() * 6) + 3, [])
  return (
    <div className={styles.placeholder}>
      <div className={styles.avatar} key='avatar' />
      <div className={styles.user} key='user'>
        <div
          className={styles.username}
          key='username'
          style={{ width: `${username}rem` }}
        />
        <div
          className={styles.status}
          key='status'
          style={{ width: `${status}rem` }}
        />
      </div>
    </div>
  )
}

const ConversationCard = {
  View: ConversationCardView,
  Placeholder: ConversationCardPlaceholder
}

export default ConversationCard
