import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect
} from 'react'
import styles from './Messages.module.scss'
import { queryCache, useInfiniteQuery, useQuery } from 'react-query'
import { clientGateway } from '../utils/constants'
import { Auth } from '../authentication/state'
import Message from './Message'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import { Waypoint } from 'react-waypoint'
import { Channel, getMessages, Message as MessageType } from './remote'
import { useDebounce } from 'react-use'
import { getUnreads, Mentions } from '../user/remote'
import { Chat } from './state'
import { isPlatform } from '@ionic/react'
import { Plugins } from '@capacitor/core'

const { Keyboard } = Plugins

dayjs.extend(dayjsUTC)

const View = ({
  channel,
  autoRead
}: {
  channel: Channel
  autoRead: boolean
}) => {
  const { tracking, setTracking } = Chat.useContainer()
  const { token, id } = Auth.useContainer()
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<
    MessageType[],
    any
  >(['messages', channel.id, token], getMessages, {
    getFetchMore: (last) => {
      return last.length < 25 ? undefined : last[last.length - 1]?.created_at
    }
  })

  const messages = useMemo(() => data?.flat().reverse(), [data])

  const isPrimary = useCallback(
    (message: MessageType, index: number) => {
      return !(
        messages?.[index - 1] &&
        message.author.id === messages?.[index - 1]?.author?.id &&
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

  const autoScroll = useCallback(() => {
    const scrollRef = ref?.current
    if (trackingRef.current && scrollRef) {
      scrollRef.scroll({
        top: scrollRef.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [])

  useEffect(() => {
    if (isPlatform('capacitor')) {
      Keyboard.addListener('keyboardDidShow', () => {
        const scrollRef = ref?.current
        setTracking(true)
        if (scrollRef) {
          scrollRef.scroll({
            top: scrollRef.scrollHeight,
            behavior: 'smooth'
          })
        }
      })
    }

    return () => {
      if (isPlatform('capacitor')) Keyboard.removeAllListeners()
    }
  }, [setTracking, autoScroll])

  useEffect(() => {
    trackingRef.current = tracking
  }, [tracking])

  useLayoutEffect(() => {
    const scrollRef = ref?.current
    if (trackingRef.current && scrollRef) {
      scrollRef.scroll({
        top: scrollRef.scrollHeight
      })
    }
  }, [])
  useLayoutEffect(autoScroll, [messages, autoScroll])
  const unreads = useQuery(['unreads', id, token], getUnreads)

  const setAsRead = useCallback(async () => {
    if (
      tracking &&
      messages &&
      unreads.data &&
      unreads.data[channel.id] &&
      messages[messages.length - 1]?.id !== unreads.data[channel.id].read
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
          read: messages[messages.length - 1]?.id
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
    () => {
      if (autoRead) setAsRead()
    },
    500,
    [setAsRead, autoRead]
  )

  const length = useMemo(() => Math.floor(Math.random() * 10) + 8, [])

  return (
    <div key={channel.id} className={styles.messages} ref={ref}>
      {!loading && canFetchMore ? (
        <Waypoint
          bottomOffset={20}
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
      {messages?.map((message, index) =>
        message ? (
          <React.Fragment key={message.id}>
            <Message.View
              key={message.id}
              primary={isPrimary(message, index)}
              onResize={autoScroll}
              id={message.id}
              authorID={message.author.id}
              createdAt={message.created_at}
              content={message.content}
              updatedAt={message.updated_at}
            />
            {unreads.data &&
              unreads.data[channel.id]?.read === message.id &&
              unreads.data[channel.id]?.read !==
                messages[messages.length - 1]?.id && (
                <div key={`read-${message.id}`} className={styles.indicator}>
                  <span>Last Read</span>
                </div>
              )}
          </React.Fragment>
        ) : (
          <></>
        )
      )}
      <Waypoint
        topOffset={5}
        onEnter={() => setTracking(true)}
        onLeave={() => setTracking(false)}
      />
      <div key='buffer' className={styles.buffer} />
    </div>
  )
}

const Placeholder = () => {
  const length = useMemo(() => Math.floor(Math.random() * 10) + 8, [])
  return (
    <div className={styles.messages}>
      {Array.from(Array(length).keys()).map((_, index) => (
        <Message.Placeholder key={index} />
      ))}
    </div>
  )
}

const Messages = { View, Placeholder }

export default Messages
