import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache } from 'react-query'
import { Events } from '../utils/constants'
import { log } from '../utils/logging'
import { Auth } from '../authentication/state'
import { Mentions } from '../user/remote'

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
  const { id, token } = Auth.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const message = JSON.parse(e.data) as Message
      log('Events', 'purple', 'DELETED_MESSAGE')
      const initial = queryCache.getQueryData(['messages', message.channel_id])

      if (initial instanceof Array) {
        queryCache.setQueryData(
          ['messages', message.channel_id],
          initial.map((sub) =>
            sub.filter((msg: Message) => msg.id !== message.id)
          )
        )
      }

      const initialMentions: Mentions | undefined = queryCache.getQueryData([
        'mentions',
        id,
        token
      ])

      if (initialMentions) {
        queryCache.setQueryData(
          ['mentions', id, token],
          Object.fromEntries(
            Object.entries(initialMentions).map(([channel, mentions]) => [
              channel,
              mentions.filter((mention) => mention.message_id !== message.id)
            ])
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
