import { FC, memo, Suspense, useCallback, useMemo } from 'react'
import Button from '../components/Button'
import styles from './Message.module.scss'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import {
  faCopy,
  faTrashAlt,
  IconDefinition,
  faPencilAlt,
  faLock,
  faEthernet,
  faLink
} from '@fortawesome/free-solid-svg-icons'
import { Plugins } from '@capacitor/core'
import { Auth } from '../authentication/state'
import { useMutation, useQuery } from 'react-query'
import {
  clientGateway,
  MessageTypes,
  ModalTypes,
  Permissions
} from '../utils/constants'
import Context from '../components/Context'
import useMarkdown from '@innatical/markdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTimesCircle,
  faUserNinja,
  faUserShield,
  faHeart
} from '@fortawesome/free-solid-svg-icons'
import { ErrorBoundary } from 'react-error-boundary'
import { UI } from '../state/ui'
import { patchEncryptedMessage, patchMessage } from './remote'
import Editor from '../components/Editor'
import { Chat } from './state'
import { withHistory } from 'slate-history'
import { withReact } from 'slate-react'
import { withMentions } from '../utils/slate'
import { createEditor } from 'slate'
import Invite from './embeds/Invite'
import Mention from './Mention'
import { Permission } from '../utils/permissions'
import { useUser } from '../user/state'
import File from './embeds/File'
import { ExportedEncryptedMessage } from '@innatical/inncryption/dist/types'
import {
  decryptMessage,
  importEncryptedMessage,
  importPublicKey
} from '@innatical/inncryption'
import { Keychain } from '../keychain/state'
import { getKeychain } from '../user/remote'
import { getProduct, getResource } from '../community/remote'

const { Clipboard } = Plugins
dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

const stringToLineArray = (str: string) => {
  return str.split(/\n*\n/)
}

type Embed = {
  embed: React.ReactNode
  link: React.ReactNode
}

const isEmbed = (element: any): element is Embed => {
  return typeof element === 'object' && element['embed'] && element['link']
}

const EditBox: FC<{
  id: string
  content: string
  onDismiss: () => void
  encrypted: boolean
}> = ({ id, content, onDismiss, encrypted }) => {
  const { token } = Auth.useContainer()
  const editor = useMemo(
    () => withHistory(withReact(withMentions(createEditor()))),
    []
  )
  const { keychain } = Keychain.useContainer()
  const { publicEncryptionKey } = Chat.useContainer()
  return (
    <div className={styles.innerInput}>
      <Editor
        id={'editMessage'}
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
          if (encrypted) {
            await patchEncryptedMessage(
              id,
              content,
              token,
              keychain!,
              publicEncryptionKey!
            )
          } else {
            await patchMessage(id, content, token)
          }
        }}
      />

      <FontAwesomeIcon icon={faTimesCircle} onClick={() => onDismiss()} />
    </div>
  )
}

const MessageView: FC<{
  id: string
  authorID: string
  createdAt: string
  updatedAt: string
  content?: string | ExportedEncryptedMessage
  type: MessageTypes
  primary: boolean
  richContent?: {
    username?: string
    avatar?: string
    resource_id?: string
    product_id?: string
    actions?: {
      type: 'button'
      content: string
      action: number
    }[]
  }
}> = memo(
  ({ id, authorID, createdAt, primary, content, type, richContent }) => {
    const auth = Auth.useContainer()

    const { keychain } = Keychain.useContainer()
    const { data: otherKeychain } = useQuery(
      ['keychain', authorID, auth.token],
      getKeychain,
      {
        enabled: typeof content !== 'string'
      }
    )

    const { data: publicKey } = useQuery(
      ['publicKey', otherKeychain?.signing.publicKey],
      async (_: string, key: number[]) => {
        if (!key) return undefined
        return await importPublicKey(key, 'signing')
      },
      {
        enabled: typeof content !== 'string'
      }
    )

    const { data: product } = useQuery(
      ['products', richContent?.product_id, auth.token],
      getProduct,
      {
        enabled: !!richContent?.product_id
      }
    )

    const { data: resource } = useQuery(
      [
        'resource',
        richContent?.product_id,
        richContent?.resource_id,
        auth.token
      ],
      getResource,
      {
        enabled: !!richContent?.resource_id
      }
    )

    const { data: messageContent } = useQuery(
      ['messageContent', content, publicKey, keychain],
      async () => {
        if (typeof content === 'string') {
          return content
        } else {
          if (!publicKey || !keychain || !content) return ''
          try {
            const decrypted = await decryptMessage(
              keychain,
              publicKey,
              importEncryptedMessage(content)
            )

            if (decrypted.verified) {
              return decrypted.message
            } else {
              return '*The sender could not be verified...*'
            }
          } catch {
            return '*Message could not be decrypted*'
          }
        }
      }
    )
    const uiStore = UI.useContainer()
    const { editingMessageID, setEditingMessageID } = Chat.useContainerSelector(
      ({ editingMessageID, setEditingMessageID }) => ({
        editingMessageID,
        setEditingMessageID
      })
    )
    const ui = UI.useContainerSelector(({ setModal }) => ({
      setModal
    }))
    const { hasPermissions } = Permission.useContainer()
    const [deleteMessage] = useMutation(
      async () =>
        (
          await clientGateway.delete(`/messages/${id}`, {
            headers: { Authorization: auth.token }
          })
        ).data
    )
    const user = useUser(authorID)
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
              string: messageContent
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
      if (
        hasPermissions([Permissions.MANAGE_MESSAGES]) ||
        authorID === auth.id
      ) {
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
      deleteMessage,
      id,
      uiStore,
      auth.id,
      setEditingMessageID,
      hasPermissions,
      messageContent
    ])
    const output = useMarkdown(messageContent!, {
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
              <span key={key}>
                <ErrorBoundary fallbackRender={() => <Invite.ErrorEmbed />}>
                  <Suspense fallback={<Invite.Placeholder />}>
                    <Invite.Embed url={str} />
                  </Suspense>
                </ErrorBoundary>
              </span>
            )
          }
        } else if (File.isFile(str)) {
          return {
            link: <></>,
            embed: (
              <ErrorBoundary fallbackRender={() => <p>{link}</p>}>
                <File.Embed key={key} url={str} />
              </ErrorBoundary>
            )
          }
        } else {
          return link
        }
      },
      codeblock: (str, key) => ({
        link: <></>,
        embed: str ? (
          <div key={key} className={styles.code}>
            {stringToLineArray(str.trim()).map((e: string, i: number) =>
              i < 999 ? (
                <span className={styles.line}>
                  <p className={styles.lineIndicator}>
                    {i + 1}{' '}
                    {' '.repeat(3 - (i + 1).toString().split('').length)}
                  </p>
                  <p className={styles.lineContent}>{e}</p>
                </span>
              ) : (
                <></>
              )
            )}
            <Button
              type='button'
              onClick={async () => {
                await Clipboard.write({
                  string: str
                })

                await Plugins.LocalNotifications.schedule({
                  notifications: [
                    {
                      title: 'Successfully copied code block!',
                      body: str.slice(0, 20) + '...',
                      id: 1
                    }
                  ]
                })
              }}
              className={styles.copyCodeButton}
            >
              Copy Code
            </Button>
          </div>
        ) : (
          <></>
        )
      }),
      custom: [
        [
          /<@([A-Za-z0-9-]+?)>/g,
          (str, key) => (
            <span key={key}>
              <ErrorBoundary fallbackRender={() => <span>&lt;@{str}&gt;</span>}>
                <Suspense fallback={<span>@unknown</span>}>
                  <Mention.User
                    userID={str}
                    selected={type !== MessageTypes.NORMAL}
                  />
                </Suspense>
              </ErrorBoundary>
            </span>
          )
        ],
        [
          /<#([A-Za-z0-9-]+?)>/g,
          (str, key) => (
            <span key={key}>
              <ErrorBoundary fallbackRender={() => <span>&lt;@{str}&gt;</span>}>
                <Suspense fallback={<span>#unknown</span>}>
                  <Mention.Channel
                    channelID={str}
                    selected={type !== MessageTypes.NORMAL}
                  />
                </Suspense>
              </ErrorBoundary>
            </span>
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
        title={`${
          resource?.name || richContent?.username || user?.username || 'Unknown'
        }'s Message`}
        message={messageContent}
        key={id}
        items={getItems()}
      >
        <div
          className={`${styles.message} ${
            primary ||
            (type !== MessageTypes.NORMAL &&
              type !== MessageTypes.WEBHOOK &&
              type !== MessageTypes.INTEGRATION)
              ? styles.primary
              : ''
          } ${
            type === MessageTypes.MEMBER_ADDED
              ? styles.joined
              : type === MessageTypes.MEMBER_REMOVED
              ? styles.left
              : ''
          }`}
        >
          {primary &&
            (type === MessageTypes.NORMAL ||
              type === MessageTypes.WEBHOOK ||
              type === MessageTypes.INTEGRATION) && (
              <div
                className={styles.avatar}
                style={{
                  backgroundImage: `url(${
                    product?.icon || richContent?.avatar || user?.avatar
                  })`
                }}
                onClick={() => {
                  if (type === MessageTypes.NORMAL) {
                    ui.setModal({
                      name: ModalTypes.PREVIEW_USER,
                      props: { id: user?.id }
                    })
                  }
                }}
              />
            )}
          <div
            className={`${styles.content} ${
              !(
                primary ||
                (type !== MessageTypes.NORMAL &&
                  type !== MessageTypes.WEBHOOK &&
                  type !== MessageTypes.INTEGRATION)
              )
                ? styles.spacer
                : ''
            }`}
          >
            {primary &&
              (type === MessageTypes.NORMAL ||
                type === MessageTypes.WEBHOOK ||
                type === MessageTypes.INTEGRATION) && (
                <h2
                  key='username'
                  onClick={() => {
                    if (type === MessageTypes.NORMAL) {
                      ui.setModal({
                        name: ModalTypes.PREVIEW_USER,
                        props: { id: user?.id }
                      })
                    }
                  }}
                >
                  <span>
                    {resource?.name || richContent?.username || user?.username}
                    {user?.id === '987d59ba-1979-4cc4-8818-7fe2f3d4b560' ? (
                      <FontAwesomeIcon
                        className={styles.badge}
                        icon={faUserNinja}
                      />
                    ) : user?.id === '71df7ca2-93c5-4a8a-be6e-f068fd91d68e' ? (
                      <FontAwesomeIcon
                        className={styles.badge}
                        icon={faHeart}
                      />
                    ) : type === MessageTypes.WEBHOOK ? (
                      <FontAwesomeIcon
                        className={styles.badge}
                        icon={faEthernet}
                      />
                    ) : type === MessageTypes.INTEGRATION ? (
                      <FontAwesomeIcon className={styles.badge} icon={faLink} />
                    ) : (
                      user?.discriminator === 0 && (
                        <FontAwesomeIcon
                          className={styles.badge}
                          icon={faUserShield}
                        />
                      )
                    )}
                    {typeof content === 'object' ? (
                      <FontAwesomeIcon className={styles.badge} icon={faLock} />
                    ) : (
                      <></>
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
                content={messageContent!}
                onDismiss={() => setEditingMessageID(undefined)}
                encrypted={typeof content === 'object' ? true : false}
              />
            ) : (
              <p key={id} className={styles.selectable}>
                {main}
              </p>
            )}
            {embeds.length > 0 ? embeds : <></>}
            {richContent?.actions?.length ?? 0 > 0 ? (
              <div className={styles.actions}>
                {richContent?.actions?.map(({ content }) => (
                  <Button type='button'>{content}</Button>
                ))}
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </Context.Wrapper>
    )
  }
)

const MessagePlaceholder: FC = () => {
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
