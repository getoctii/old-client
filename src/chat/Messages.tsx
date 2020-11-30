import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import styles from './Messages.module.scss'
import { queryCache, useInfiniteQuery } from 'react-query'
import { clientGateway } from '../utils/constants'
import { Auth } from '../authentication/state'
import Message from './Message'
import moment from 'moment'
import { Waypoint } from 'react-waypoint'
import { Channel } from './remote'
import { useDebounce } from 'react-use'

interface MessageType {
  id: string
  author: {
    id: string
    username: string
    avatar: string
    discriminator: number
  }
  created_at: string
  updated_at: string
  content: string
}

const View = ({
  channel,
  onTrackChange,
  autoRead
}: {
  channel: Channel
  onTrackChange: (tracking: boolean) => void
  autoRead: boolean
}) => {
  const { token } = Auth.useContainer()
  const fetchMessages = async (_: string, channelID: string, date: string) => {
    return (
      await clientGateway.get<MessageType[]>(
        `/channels/${channelID}/messages`,
        {
          headers: { Authorization: token },
          params: { created_at: date }
        }
      )
    ).data
  }
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<
    MessageType[],
    any
  >(['messages', channel.id], fetchMessages, {
    getFetchMore: (last) => {
      return last.length < 25 ? undefined : last[last.length - 1]?.created_at
    }
  })

  const messages = useMemo(() => data?.flat().reverse(), [data])

  const isPrimary = (message: MessageType, index: number) => {
    return !(
      messages?.[index - 1] &&
      message.author.id === messages?.[index - 1]?.author?.id &&
      moment.utc(message?.created_at)?.valueOf() -
        moment.utc(messages?.[index - 1]?.created_at)?.valueOf() <
        300000
    )
  }

  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [tracking, setTracking] = useState(true)

  useEffect(() => {
    onTrackChange(tracking)
  }, [tracking, onTrackChange])

  const autoScroll = useCallback(() => {
    const scrollRef = ref?.current
    if (tracking && scrollRef) {
      scrollRef.scrollTop = scrollRef.scrollHeight - scrollRef.clientHeight
    }
  }, [tracking, ref])

  useEffect(autoScroll, [messages, autoScroll])

  const setAsRead = useCallback(async () => {
    console.log(tracking, messages, channel)
    if (
      tracking &&
      messages &&
      messages[messages.length - 1]?.id !== channel.read
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
      console.log(['channel', channel.id, token])
      queryCache.setQueryData(['channel', channel.id, token], {
        ...channel,
        read: messages[messages.length - 1]?.id
      })
    }
  }, [tracking, messages, channel, token])

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
              setLoading(true)
              const oldHeight = current.scrollHeight
              const oldTop = current.scrollTop
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
            <>
              <Message.Placeholder key={index} />
            </>
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
          <>
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
            {channel?.read === message.id &&
              channel.read !== messages[messages.length - 1]?.id && (
                <div key={`read-${message.id}`} className={styles.indicator}>
                  <span>Last Read</span>
                </div>
              )}
          </>
        ) : (
          <></>
        )
      )}
      <Waypoint
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
        <>
          <Message.Placeholder key={index} />
        </>
      ))}
    </div>
  )
}

const Messages = { View, Placeholder }

export default Messages
