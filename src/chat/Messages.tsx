import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  FC
} from 'react'
import styles from './Messages.module.scss'
import { queryCache, useInfiniteQuery, useQuery } from 'react-query'
import { clientGateway } from '../utils/constants'
import { Auth } from '../authentication/state'
import Message from './Message'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import { Waypoint } from 'react-waypoint'
import { ChannelResponse, getMessages, MessageResponse } from './remote'
import { useDebounce } from 'react-use'
import { getUnreads, Mentions } from '../user/remote'
import { Chat } from './state'
import { isPlatform } from '@ionic/react'
import { Plugins } from '@capacitor/core'
import { Keychain } from '../keychain/state'

const { Keyboard } = Plugins

dayjs.extend(dayjsUTC)

const MessagesView: FC<{ channel: ChannelResponse }> = ({ channel }) => {
  const {
    tracking,
    setTracking,
    editingMessageID,
    autoRead,
    setAutoRead,
    setChannelID
  } = Chat.useContainerSelector(
    ({
      tracking,
      setTracking,
      editingMessageID,
      autoRead,
      setAutoRead,
      setChannelID
    }) => ({
      tracking,
      setTracking,
      editingMessageID,
      autoRead,
      setAutoRead,
      setChannelID
    })
  )

  const { keychain } = Keychain.useContainer()

  useEffect(() => {
    setChannelID(channel.id)
    setAutoRead(true)
    setTracking(true)
  }, [setAutoRead, setTracking, setChannelID, channel.id])

  const { token, id } = Auth.useContainer()
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<
    MessageResponse[],
    any
  >(['messages', channel.id, token], getMessages, {
    getFetchMore: (last) => {
      return last.length < 25 ? undefined : last[last.length - 1].id
    }
  })

  const messages = useMemo(() => data?.flat(), [data])

  const isPrimary = useCallback(
    (message: MessageResponse, index: number) => {
      return !(
        messages?.[index + 1] &&
        message.author_id === messages?.[index + 1]?.author_id &&
        message.content === messages?.[index + 1]?.content &&
        dayjs.utc(message?.created_at)?.valueOf() -
          dayjs.utc(messages?.[index - 1]?.created_at)?.valueOf() <
          300000
      )
    },
    [messages]
  )

  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const trackingRef = useRef(tracking)

  useEffect(() => {
    if (isPlatform('capacitor')) {
      Keyboard.addListener('keyboardDidShow', () => {
        if (!editingMessageID) {
          const scrollRef = ref?.current
          setTracking(true)
          if (scrollRef) {
            scrollRef.scroll({
              top: scrollRef.scrollHeight,
              behavior: 'smooth'
            })
          }
        }
      })
    }

    return () => {
      if (isPlatform('capacitor')) Keyboard.removeAllListeners()
    }
  }, [setTracking, editingMessageID])

  useEffect(() => {
    trackingRef.current = tracking
  }, [tracking])

  const unreads = useQuery(['unreads', id, token], getUnreads)

  const setAsRead = useCallback(async () => {
    if (
      tracking &&
      messages &&
      unreads.data &&
      unreads.data[channel.id] &&
      messages[0]?.id !== unreads.data[channel.id].read
    ) {
      await clientGateway.post(
        `/channels/${channel.id}/read`,
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
        [channel.id]: {
          ...initial[channel.id],
          read: messages[0]?.id
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
          [channel.id]: initialMentions[channel.id]?.map((m) => ({
            ...m,
            read: true
          }))
        })
      }
    }
  }, [tracking, messages, channel, token, unreads, id])

  const setAsReadHack = useRef(setAsRead)

  useEffect(() => {
    setAsReadHack.current = setAsRead
  }, [setAsRead])
  useEffect(
    () => () => {
      setAsReadHack.current()
    },
    []
  )
  useDebounce(
    async () => {
      if (autoRead) await setAsRead()
    },
    500,
    [setAsRead, autoRead]
  )

  const length = useMemo(() => Math.floor(Math.random() * 10) + 8, [])

  if (!keychain) return <div key={channel.id} className={styles.messages}></div>

  return (
    <div key={channel.id} className={styles.messages} ref={ref}>
      <div key='buffer' className={styles.buffer} />
      <Waypoint
        topOffset={5}
        onEnter={() => setTracking(true)}
        onLeave={() => setTracking(false)}
      />
      {messages?.map((message, index) =>
        message ? (
          <React.Fragment key={message.id}>
            {unreads.data &&
              unreads.data[channel.id]?.read === message.id &&
              unreads.data[channel.id]?.read !== messages[0]?.id && (
                <div key={`read-${message.id}`} className={styles.indicator}>
                  <hr />
                  <span>Last Read</span>
                </div>
              )}
            <Message.View
              key={message.id}
              primary={isPrimary(message, index)}
              id={message.id}
              type={message.type}
              authorID={message.author_id}
              createdAt={message.created_at}
              content={
                message.content ??
                (message.author_id === id
                  ? message.self_encrypted_content
                  : message.encrypted_content)
              }
              updatedAt={message.updated_at}
            />
          </React.Fragment>
        ) : (
          <></>
        )
      )}
      {!canFetchMore ? (
        <div key='header' className={styles.top}>
          <h3>
            Woah, you reached the top of the chat. Here's a cookie{' '}
            <span role='img' aria-label='Cookie'>
              🍪
            </span>
          </h3>
        </div>
      ) : (
        <></>
      )}
      {loading && (
        <div className={styles.messages}>
          {Array.from(Array(length).keys()).map((_, index) => (
            <Message.Placeholder key={index} />
          ))}
        </div>
      )}
      {!loading && canFetchMore ? (
        <div className={styles.waypoint}>
          <Waypoint
            bottomOffset={30}
            onEnter={async () => {
              try {
                const current = ref.current
                if (!current || !current.scrollHeight) return
                const oldHeight = current.scrollHeight
                const oldTop = current.scrollTop
                setLoading(true)
                await fetchMore()
                if (!ref.current) return
                ref.current.scrollTop = current.scrollHeight
                  ? current.scrollHeight - oldHeight + oldTop
                  : 0
              } finally {
                setLoading(false)
              }
            }}
          />
        </div>
      ) : (
        <></>
      )}{' '}
    </div>
  )
}

const MessagesPlaceholder: FC = () => {
  const length = useMemo(() => Math.floor(Math.random() * 10) + 8, [])
  return (
    <div className={styles.messages}>
      {Array.from(Array(length).keys()).map((_, index) => (
        <Message.Placeholder key={index} />
      ))}
    </div>
  )
}

const Messages = { View: MessagesView, Placeholder: MessagesPlaceholder }

export default Messages
