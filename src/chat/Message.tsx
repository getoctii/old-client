import React, { memo, Suspense, useCallback, useMemo } from 'react'
import styles from './Message.module.scss'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import {
  faCopy,
  faTrashAlt,
  IconDefinition
} from '@fortawesome/pro-solid-svg-icons'
import { Plugins } from '@capacitor/core'
import { Auth } from '../authentication/state'
import { useMutation, useQuery } from 'react-query'
import {
  clientGateway,
  MessageTypes,
  ModalTypes,
  Permissions
} from '../utils/constants'
import { getUser } from '../user/remote'
import { Measure } from './embeds/Measure'
import Context from '../components/Context'
import Audio from './embeds/Audio'
import Image from './embeds/Image'
import useMarkdown from '@innatical/markdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCatSpace,
  faPaintBrush,
  faTimesCircle,
  faUserNinja,
  faUserShield
} from '@fortawesome/pro-duotone-svg-icons'
import { ErrorBoundary } from 'react-error-boundary'
import { UI } from '../state/ui'
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { patchMessage } from './remote'
import Editor from '../components/Editor'
import { Chat } from './state'
import { withHistory } from 'slate-history'
import { withReact } from 'slate-react'
import { withMentions } from '../utils/slate'
import { createEditor } from 'slate'
import Invite from './embeds/Invite'
import Mention from './Mention'
import { Permission } from '../utils/permissions'

const { Clipboard } = Plugins
dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

type Embed = {
  embed: React.ReactNode
  link: React.ReactNode
}

const isEmbed = (element: any): element is Embed => {
  return typeof element === 'object' && element['embed'] && element['link']
}

const EditBox = ({
  id,
  content,
  onDismiss
}: {
  id: string
  content: string
  onDismiss: () => void
}) => {
  const { token } = Auth.useContainer()
  const editor = useMemo(
    () => withHistory(withReact(withMentions(createEditor()))),
    []
  )
  return (
    <div className={styles.innerInput}>
      <Editor
        editor={editor}
        userMentions={false}
        className={styles.editor}
        inputClassName={styles.input}
        mentionsClassName={styles.mentionsWrapper}
        newLines
        onDismiss={onDismiss}
        emptyEditor={[
          {
            children: [{ text: content }]
          }
        ]}
        onEnter={async (content) => {
          if (!token || !content) return
          onDismiss()
          await patchMessage(id, content, token)
        }}
      />

      <FontAwesomeIcon icon={faTimesCircle} onClick={() => onDismiss()} />
    </div>
  )
}

const MessageView = memo(
  ({
    id,
    authorID,
    createdAt,
    primary,
    content,
    type,
    onResize
  }: {
    id: string
    authorID: string
    createdAt: string
    updatedAt: string
    content: string
    type: MessageTypes
    primary: boolean
    onResize: () => void
  }) => {
    const uiStore = UI.useContainer()
    const { editingMessageID, setEditingMessageID } = Chat.useContainer()
    const auth = Auth.useContainer()
    const { hasPermissions } = Permission.useContainer()
    const [deleteMessage] = useMutation(
      async () =>
        (
          await clientGateway.delete(`/messages/${id}`, {
            headers: { Authorization: auth.token }
          })
        ).data
    )
    const user = useQuery(['users', authorID, auth.token], getUser)
    const getItems = useCallback(() => {
      const items: {
        text: string
        icon: IconDefinition
        danger: boolean
        onClick: any
      }[] = [
        {
          text: 'Copy Message',
          icon: faCopy,
          danger: false,
          onClick: async () => {
            await Clipboard.write({
              string: content
            })
          }
        },
        {
          text: 'Copy ID',
          icon: faCopy,
          danger: false,
          onClick: async () => {
            await Clipboard.write({
              string: id
            })
          }
        }
      ]

      if (authorID === auth.id) {
        items.push({
          text: 'Edit Message',
          icon: faPencilAlt,
          danger: false,
          onClick: () => setEditingMessageID(id)
        })
      }
      if (hasPermissions([Permissions.MANAGE_MESSAGES])) {
        items.push({
          text: 'Delete Message',
          icon: faTrashAlt,
          danger: true,
          onClick: () =>
            uiStore.setModal({
              name: ModalTypes.DELETE_MESSAGE,
              props: {
                type: 'message',
                onConfirm: async () => {
                  await deleteMessage()
                  uiStore.clearModal()
                },
                onDismiss: () => uiStore.clearModal()
              }
            })
        })
      }
      return items
    }, [
      authorID,
      content,
      deleteMessage,
      id,
      uiStore,
      auth.id,
      setEditingMessageID,
      hasPermissions
    ])
    const output = useMarkdown(content, {
      bold: (str, key) => <strong key={key}>{str}</strong>,
      italic: (str, key) => <i key={key}>{str}</i>,
      underlined: (str, key) => <u key={key}>{str}</u>,
      strikethough: (str, key) => <del key={key}>{str}</del>,
      link: (str, key) => {
        const link = (
          <a
            href={str}
            key={`${key}-href`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {str}
          </a>
        )
        if (Invite.isInvite(str)) {
          return {
            link: <></>,
            embed: (
              <ErrorBoundary
                fallbackRender={() => <Invite.ErrorEmbed key={key} />}
              >
                <Suspense fallback={<Invite.Placeholder key={key} />}>
                  <Invite.Embed key={key} url={str} />
                </Suspense>
              </ErrorBoundary>
            )
          }
        } else if (Image.isCovfefe(str)) {
          return {
            link,
            embed: <Image.Embed key={key} url={str} />
          }
        } else if (Audio.isCovfefe(str)) {
          return {
            link,
            embed: <Audio.Embed key={key} url={str} />
          }
        } else {
          return link
        }
      },
      codeblock: (str, key) => <code key={key}>{str}</code>,
      custom: [
        [
          /<@([A-Za-z0-9-]+?)>/g,
          (str, key) => (
            <Suspense fallback={<span key={key}>@unknown</span>}>
              <ErrorBoundary
                fallbackRender={() => <span key={key}>&lt;@{str}&gt;</span>}
              >
                <Mention.User
                  key={key}
                  userID={str}
                  selected={type !== MessageTypes.NORMAL}
                />
              </ErrorBoundary>
            </Suspense>
          )
        ],
        [
          /<#([A-Za-z0-9-]+?)>/g,
          (str, key) => (
            <Suspense fallback={<span key={key}>#unknown</span>}>
              <ErrorBoundary
                fallbackRender={() => <span key={key}>&lt;@{str}&gt;</span>}
              >
                <Mention.Channel
                  key={key}
                  channelID={str}
                  selected={type !== MessageTypes.NORMAL}
                />
              </ErrorBoundary>
            </Suspense>
          )
        ]
      ]
    })
    const main = useMemo(
      () =>
        output.map((element) => (isEmbed(element) ? element.link : element)),
      [output]
    )
    const embeds = useMemo(
      () => output.filter(isEmbed).map((element) => element.embed),
      [output]
    )
    return (
      <Context.Wrapper
        title={`${user.data?.username || 'Unknown'}'s Message`}
        message={content}
        key={id}
        items={getItems()}
      >
        <div
          className={`${styles.message} ${
            primary || type !== MessageTypes.NORMAL ? styles.primary : ''
          } ${
            type === MessageTypes.MEMBER_ADDED
              ? styles.joined
              : type === MessageTypes.MEMBER_REMOVED
              ? styles.left
              : ''
          }`}
        >
          {primary && type === MessageTypes.NORMAL && (
            <div
              className={styles.avatar}
              style={{ backgroundImage: `url(${user.data?.avatar})` }}
            />
          )}
          <div
            className={`${styles.content} ${
              !(primary || type !== MessageTypes.NORMAL) ? styles.spacer : ''
            }`}
          >
            {primary && type === MessageTypes.NORMAL && (
              <h2 key='username'>
                <span>
                  {user.data?.username}
                  {user.data?.id === '987d59ba-1979-4cc4-8818-7fe2f3d4b560' ? (
                    <FontAwesomeIcon
                      className={styles.badge}
                      icon={faUserNinja}
                    />
                  ) : user.data?.id ===
                    '99343aac-2301-415d-aece-17b021d3a459' ? (
                    <FontAwesomeIcon
                      className={styles.badge}
                      icon={faCatSpace}
                    />
                  ) : user.data?.id ===
                    '4e317329-8b17-4473-b1e1-4ceb9056cb5b' ? (
                    <FontAwesomeIcon
                      className={styles.badge}
                      icon={faPaintBrush}
                    />
                  ) : (
                    user.data?.discriminator === 0 && (
                      <FontAwesomeIcon
                        className={styles.badge}
                        icon={faUserShield}
                      />
                    )
                  )}
                </span>
                <span className={styles.time}>
                  {dayjs.utc(createdAt).local().calendar()}
                </span>
              </h2>
            )}
            {editingMessageID === id ? (
              <EditBox
                id={id}
                content={content}
                onDismiss={() => setEditingMessageID(undefined)}
              />
            ) : (
              <p key={id}>{main}</p>
            )}
            <Measure onResize={onResize}>{embeds}</Measure>
          </div>
        </div>
      </Context.Wrapper>
    )
  }
)

const MessagePlaceholder = () => {
  const username = useMemo(() => Math.floor(Math.random() * 6) + 3, [])
  const message = useMemo(() => Math.floor(Math.random() * 10) + 8, [])
  const isPrimary = useMemo(() => Math.floor(Math.random() * 1000000) + 1, [])
  return (
    <div
      className={`${styles.placeholder} ${
        isPrimary % 2 === 0 ? styles.primary : ''
      }`}
    >
      {isPrimary % 2 === 0 && <div className={styles.avatar} />}
      <div
        className={`${styles.content} ${
          isPrimary % 2 !== 0 ? styles.spacer : ''
        }`}
      >
        <div className={styles.user}>
          {isPrimary % 2 === 0 && (
            <div
              className={styles.username}
              style={{ width: `${username}rem` }}
            />
          )}
          {isPrimary % 2 === 0 && <div className={styles.date} />}
        </div>
        <div className={styles.message} style={{ width: `${message}rem` }} />
      </div>
    </div>
  )
}

const Message = { View: MessageView, Placeholder: MessagePlaceholder, Mention }

export default Message
