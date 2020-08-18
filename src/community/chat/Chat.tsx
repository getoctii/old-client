import React, { useState } from 'react'
import styles from './Chat.module.scss'
import { useInfiniteQuery, useMutation } from 'react-query'
import { clientGateway } from '../../constants'
import { Auth } from '../../authentication/state'
import InfiniteScroll from 'react-infinite-scroller'
import Message from './Message'

interface Message {
  id: string
  author: {
    id: string
    username: string
    avatar: string
    discriminator: number
  },
  created_at: string
  updated_at: string
  content: string
}

const Chat = ({ channelID }: { channelID: string }) => {
  const { token } = Auth.useContainer()
  const fetchMessages = async (_: string, channel: string, date: string) => {
    return (await clientGateway.get<Message[]>(`/channels/${channel}/messages`, {
      headers: { Authorization: token },
      params: { created_at: date }
    })).data
  }
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<Message[], any, string | undefined>(['messages', channelID], fetchMessages, {
    getFetchMore: (last) => {
      return last[last.length - 1]?.created_at
    }
  })
  console.log(data)
  const [message, setMessage] = useState('')
  const [sendMessage] = useMutation(async (content: string) =>
    (await clientGateway.post(`/channels/${channelID}/messages`, new URLSearchParams({ content }), { headers: { Authorization: token } })).data
  )
  return (
    <div className={styles.chat}>
      <div className={styles.header}>
        Adam#6969
      </div>
      <div className={styles.messages}>
        <InfiniteScroll loader={<h1>Loading more...</h1>} hasMore={canFetchMore} loadMore={(page) => {
          console.log(page)
          fetchMore()
        }} isReverse useWindow={false}>
          {data?.flatMap(page => page.map(message => <Message key={message.id} avatar={message.author.avatar}
                                                              timestamp={message.created_at}
                                                              author={`${message.author.username}#${message.author.discriminator}`}>{message.content}</Message>)).reverse()}
        </InfiniteScroll>
      </div>
      <div className={styles.box}>
        <form onSubmit={(e) => {
          e.preventDefault()
          sendMessage(message)
        }}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} type='text'
                 placeholder='Type something...'/>
        </form>
      </div>
    </div>
  )
}

export default Chat
