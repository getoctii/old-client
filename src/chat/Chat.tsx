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
import { clientGateway } from '../constants'
import { Auth } from '../authentication/state'
import Message from './Message'
import { useDropArea } from 'react-use'
import moment from 'moment'
import { Waypoint } from 'react-waypoint'
import Loader from '../components/Loader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faHashtag } from '@fortawesome/pro-solid-svg-icons'
import { useMedia } from 'react-use'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import Box from './Box'
import Typing from '../state/typing'

interface Message {
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
      await clientGateway.get<Message[]>(`/channels/${channel}/messages`, {
        headers: { Authorization: token },
        params: { created_at: date }
      })
    ).data
  }
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<Message[], any>(
    ['messages', channelID],
    fetchMessages,
    {
      getFetchMore: (last) => {
        return last.length < 25 ? undefined : last[last.length - 1]?.created_at
      }
    }
  )

  const messages = useMemo(() => data?.flat().reverse(), [data])

  const isPrimary = (message: Message, index: number) => {
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
          <Message
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

const Chat = ({
  channelID,
  title,
  status
}: {
  channelID: string
  title: string
  status?: string
}) => {
  const { token, id } = Auth.useContainer()
  const { typing } = Typing.useContainer()
  const users = typing[channelID]
    ?.filter((userID) => userID[0] !== id)
    .map((t) => t[1])
  const [sendMessage] = useMutation(
    async (content: string) =>
      (
        await clientGateway.post(
          `/channels/${channelID}/messages`,
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
    clientGateway.post(`/channels/${channelID}/typing`, undefined, {
      headers: {
        Authorization: token
      }
    })
  }

  const [bond] = useDropArea({
    onFiles: (files) => uploadFile(files[0])
  })

  return (
    <Suspense fallback={<Loader />}>
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
            {title}
            <p className={styles.status}>{status}</p>
          </div>
        </div>
        <Messages channelID={channelID} />
        <Box
          {...{
            sendMessage,
            uploadFile,
            postTyping,
            typingIndicator: users?.length > 0
          }}
        />
        <TypingIndicator channelID={channelID} />
      </div>
    </Suspense>
  )
}

Chat.whyDidYouRender = true

export default Chat
