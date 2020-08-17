import React, {useState} from 'react'
import styles from './Chat.module.scss'
import { useInfiniteQuery, useMutation } from 'react-query'
import { clientGateway } from '../../constants'
import { Auth } from '../../authentication/state'

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
  const fetchMessages = async (_: string, date: string) => (await clientGateway.get<Message[]>(`/channels/${channelID}/messages`, { headers: { Authorization: token }, data: { created_at: date }})).data
  const { status, data } = useInfiniteQuery<Message[], any, string | undefined>(['messages', channelID], fetchMessages, {
    getFetchMore: (last, all) => {
      return last[last.length - 1]?.created_at
    }
  })
  console.log(data)
  const [message, setMessage] = useState('')
  const [sendMessage] = useMutation(async (content: string) =>
    (await clientGateway.post(`/channels/${channelID}/messages`, new URLSearchParams({content}), { headers: { Authorization: token }})).data
  )
  return (
    <div className={styles.chat}>
      <div className={styles.header}>
        Lleyton#inn
      </div>
      <div className={styles.messages}></div>
      <div className={styles.box}>
        <form onSubmit={(e) => {
          e.preventDefault()
          sendMessage(message)
        }}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} type='text' placeholder='Type something...' />
        </form>
      </div>
    </div>
  )
}

export default Chat
