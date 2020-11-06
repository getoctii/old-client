import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../constants'

interface Message {
  id: string
  channel_id: string
  author: {
    id: string
    username: string
    avatar: string
    discriminator: number
  }
  created_at: string
  updated_at: string
  content: string
  community_id?: string
  community_name?: string
  channel_name?: string
}

const useDeletedMessage = (eventSource: EventSourcePolyfill | null) => {
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const message = JSON.parse(e.data) as Message
      const initial = queryCache.getQueryData(['messages', message.channel_id])

      if (initial instanceof Array) {
        queryCache.setQueryData(
          ['messages', message.channel_id],
          initial.map((sub) =>
            sub.filter((msg: Message) => msg.id !== message.id)
          )
        )
      }
    }

    eventSource.addEventListener(Events.DELETED_MESSAGE, handler)

    return () => {
      eventSource.removeEventListener(Events.DELETED_MESSAGE, handler)
    }
  })
}

export default useDeletedMessage
