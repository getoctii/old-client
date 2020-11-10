import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useCallback,
  useMemo
} from 'react'
import styles from './Chat.module.scss'
import { useInfiniteQuery, useMutation } from 'react-query'
import { ChannelTypes, clientGateway } from '../constants'
import { Auth } from '../authentication/state'
import Message from './Message'
import { useDropArea } from 'react-use'
import moment from 'moment'
import { Waypoint } from 'react-waypoint'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faHashtag,
  faPhoneRotary,
  faPhoneSlash
} from '@fortawesome/pro-solid-svg-icons'
import { useMedia } from 'react-use'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import Box from './Box'
import Typing from '../state/typing'
import { Call } from '../state/call'
import Button from '../components/Button'
import { UserResponse } from '../user/remote'

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

const Messages = ({ channelID }: { channelID: string }) => {
  const { token } = Auth.useContainer()
  const fetchMessages = async (_: string, channel: string, date: string) => {
    return (
      await clientGateway.get<MessageType[]>(`/channels/${channel}/messages`, {
        headers: { Authorization: token },
        params: { created_at: date }
      })
    ).data
  }
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<
    MessageType[],
    any
  >(['messages', channelID], fetchMessages, {
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

  const autoScroll = useCallback(() => {
    const scrollRef = ref?.current
    if (tracking && scrollRef) {
      scrollRef.scrollTop = scrollRef.scrollHeight - scrollRef.clientHeight
    }
  }, [tracking, ref])

  useEffect(autoScroll, [messages, autoScroll])

  return (
    <div key={channelID} className={styles.messages} ref={ref}>
      {!loading && canFetchMore ? (
        <Waypoint
          bottomOffset={20}
          onEnter={async () => {
            try {
              if (!ref.current || !ref.current.scrollHeight) return
              setLoading(true)
              const oldHeight = ref.current.scrollHeight
              const oldTop = ref.current.scrollTop
              await fetchMore()
              ref.current.scrollTop = ref?.current?.scrollHeight
                ? ref.current.scrollHeight - oldHeight + oldTop
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
        <div key='loader' className={styles.loader}>
          <h5>Loading more...</h5>
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

const TypingIndicator = ({ channelID }: { channelID: string }) => {
  const { id } = Auth.useContainer()
  const { typing } = Typing.useContainer()
  const users = typing[channelID]
    ?.filter((userID) => userID[0] !== id)
    .map((t) => t[1])
  if (users?.length > 0)
    return (
      <p className={styles.typing}>
        {users?.length === 1
          ? `${users[0]} is typing...`
          : users?.length === 2
          ? `${users.join(' and ')} are typing...`
          : users?.length > 2
          ? `${users.slice(-1).join(', ')} and ${
              users[users.length - 1]
            } are typing...`
          : users?.length > 3
          ? 'A lot of people are typing...'
          : ''}
      </p>
    )
  else return <div className={styles.typingEmpty}></div>
}

const View = ({
  type,
  channel,
  user
}: {
  type: ChannelTypes
  channel: {
    id: string
    name?: string
    color?: string
    description?: string
  }
  user?: UserResponse
}) => {
  const { token, id } = Auth.useContainer()
  const call = Call.useContainer()
  const { typing } = Typing.useContainer()
  const users = typing[channel.id]
    ?.filter((userID) => userID[0] !== id)
    .map((t) => t[1])
  const [sendMessage] = useMutation(
    async (content: string) =>
      (
        await clientGateway.post(
          `/channels/${channel.id}/messages`,
          new URLSearchParams({ content }),
          { headers: { Authorization: token } }
        )
      ).data
  )

  const isMobile = useMedia('(max-width: 800px)')
  const history = useHistory()

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axios.post(
      'https://covfefe.innatical.com/api/v1/upload',
      formData
    )
    await sendMessage(response.data.url)
  }

  const postTyping = async () => {
    clientGateway.post(`/channels/${channel.id}/typing`, undefined, {
      headers: {
        Authorization: token
      }
    })
  }

  const [bond] = useDropArea({
    onFiles: (files) => uploadFile(files[0])
  })

  return (
    <Suspense fallback={<Placeholder />}>
      <div className={styles.chat} {...bond}>
        <div className={styles.header}>
          {isMobile ? (
            <div
              className={styles.icon}
              onClick={() => isMobile && history.goBack()}
            >
              <FontAwesomeIcon
                className={styles.backButton}
                icon={faChevronLeft}
              />
            </div>
          ) : (
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faHashtag} />
            </div>
          )}
          <div className={styles.title}>
            {channel.name ||
              `${user?.username}#${
                user?.discriminator === 0
                  ? 'inn'
                  : user?.discriminator.toString().padStart(4, '0')
              }`}
            <p className={styles.status}>
              {channel.description || user?.status}
            </p>
          </div>
          {type === ChannelTypes.PrivateChannel &&
            user?.id &&
            call.otherUserID !== user.id && (
              <Button
                type='button'
                onClick={() => {
                  console.log('calling uwu')
                  if (call.callState !== 'idle') call.endCall()
                  call.ringUser(user.id)
                }}
              >
                {call.callState !== 'idle' ? (
                  <FontAwesomeIcon icon={faPhoneSlash} />
                ) : (
                  <FontAwesomeIcon icon={faPhoneRotary} />
                )}
              </Button>
            )}
        </div>
        <Messages channelID={channel.id} />
        <Box.View
          {...{
            sendMessage,
            uploadFile,
            postTyping,
            typingIndicator: users?.length > 0
          }}
        />
        <TypingIndicator channelID={channel.id} />
      </div>
    </Suspense>
  )
}

const Placeholder = () => {
  const length = useMemo(() => Math.floor(Math.random() * 10) + 8, [])
  const username = useMemo(() => Math.floor(Math.random() * 6) + 3, [])
  const status = useMemo(() => Math.floor(Math.random() * 10) + 8, [])
  return (
    <div className={styles.placeholder}>
      <div className={styles.header}>
        <div className={styles.icon} />
        <div className={styles.title}>
          <div className={styles.name} style={{ width: `${username}rem` }} />
          <div className={styles.status} style={{ width: `${status}rem` }} />
        </div>
      </div>
      <div className={styles.messages}>
        {Array.from(Array(length).keys()).map((_, index) => (
          <>
            <Message.Placeholder key={index} />
          </>
        ))}
      </div>
      <br />
      <Box.Placeholder />
    </div>
  )
}

const Chat = { View, Placeholder }

export default Chat
