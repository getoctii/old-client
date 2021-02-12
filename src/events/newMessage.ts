import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache, useQuery } from 'react-query'
import { isPlatform } from '@ionic/react'
import Typing from '../state/typing'
import { Plugins } from '@capacitor/core'
import { Events, MessageTypes } from '../utils/constants'
import { Auth } from '../authentication/state'
import {
  getUser,
  ParticipantsResponse,
  State,
  Unreads,
  UserResponse
} from '../user/remote'
import { log } from '../utils/logging'
import { Chat } from '../chat/state'
import { parseMarkdown } from '@innatical/markdown'
import { useSuspenseStorageItem } from '../utils/storage'
import { MessageResponse } from '../chat/remote'

interface Message {
  id: string
  channel_id: string
  author: {
    id: string
    username: string
    avatar: string
    discriminator: number
  }
  type: MessageTypes
  created_at: string
  updated_at: string
  content: string
  community_id?: string
  community_name?: string
  channel_name?: string
}

declare global {
  interface Window {
    inntronNotify: undefined | ((title: string, body: string) => Promise<null>)
  }
}

const useNewMessage = (eventSource: EventSourcePolyfill | null) => {
  const { autoRead, channelID } = Chat.useContainer()
  const { id, token } = Auth.useContainer()
  const { stopTyping } = Typing.useContainer()
  const [mutedCommunities] = useSuspenseStorageItem<string[]>(
    'muted-communities',
    []
  )
  const [mutedChannels] = useSuspenseStorageItem<string[]>('muted-channels', [])
  const user = useQuery(['users', id, token], getUser)
  useEffect(() => {
    if (!eventSource) return
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as Message
      log('Events', 'purple', 'NEW_MESSAGE')

      const initial = queryCache.getQueryData<MessageResponse[][]>([
        'messages',
        event.channel_id,
        token
      ])

      if (initial instanceof Array) {
        queryCache.setQueryData<MessageResponse[][]>(
          ['messages', event.channel_id, token],
          initial[0].length < 25
            ? [
                [
                  {
                    ...event,
                    author_id: event.author.id
                  },
                  ...initial[0]
                ],
                ...initial.slice(1)
              ]
            : [
                [
                  {
                    ...event,
                    author_id: event.author.id
                  }
                ],
                ...initial
              ]
        )
      }

      queryCache.setQueryData<Unreads>(['unreads', id, token], (initial) => {
        if (initial) {
          return {
            ...initial,
            [event.channel_id]: {
              ...(initial[event.channel_id] ?? {}),
              last_message_id: event.id,
              read:
                id === event.author.id ||
                (autoRead && event.channel_id === channelID)
                  ? event.id
                  : initial[event.channel_id]?.read
            }
          }
        } else {
          return {
            [event.channel_id]: {
              last_message_id: event.id,
              read:
                id === event.author.id ||
                (autoRead && event.channel_id === channelID)
                  ? event.id
                  : ''
            }
          }
        }
      })
      queryCache.setQueryData<MessageResponse>(['message', event.id, token], {
        ...event,
        author_id: event.author.id
      })

      const participants = queryCache.getQueryData<ParticipantsResponse>([
        'participants',
        id,
        token
      ])
      // maybe its this?
      if (participants instanceof Array) {
        queryCache.setQueryData<ParticipantsResponse>(
          ['participants', id, token],
          participants.map((participant) =>
            participant?.conversation?.channel_id === event.channel_id
              ? {
                  ...participant,
                  conversation: {
                    ...participant.conversation,
                    last_message_id: event.id,
                    last_message_date: event.created_at
                  }
                }
              : participant
          )
        )
      }

      if (
        event.author.id !== id &&
        !mutedCommunities?.includes(event.community_id ?? '') &&
        !mutedChannels?.includes(event.channel_id) &&
        user.data?.state !== State.dnd
      ) {
        const output = parseMarkdown(event.content, {
          bold: (str) => str,
          italic: (str) => str,
          underlined: (str) => str,
          strikethough: (str) => str,
          link: (str) => str,
          codeblock: (str) => str,
          custom: [
            [
              /<@([A-Za-z0-9-]+?)>/g,
              (str) => {
                const mention = queryCache.getQueryData<UserResponse>([
                  'users',
                  str,
                  token
                ])
                return `@${mention?.username || 'someone'}`
              }
            ]
          ]
        }).join('')
        if (window.inntronNotify) {
          try {
            await window.inntronNotify(
              `${
                event.community_name
                  ? event.community_name
                  : event.author.username
              }${event.channel_name ? ` #${event.channel_name}` : ''}`,
              `${
                event.community_name ? `${event.author.username}: ` : ''
              }${output}`
            )
          } catch (error) {
            console.error(error)
          }
        } else if (!isPlatform('capacitor')) {
          try {
            const {
              granted
            } = await Plugins.LocalNotifications.requestPermission()
            if (granted) {
              await Plugins.LocalNotifications.schedule({
                notifications: [
                  {
                    title: `${
                      event.community_name
                        ? event.community_name
                        : event.author.username
                    }${event.channel_name ? ` #${event.channel_name}` : ''}`,
                    body: `${
                      event.community_name ? `${event.author.username}: ` : ''
                    }${output}`,
                    id: 1
                  }
                ]
              })
            }
          } catch (error) {
            console.error(error)
          }
        }
      }
      stopTyping(event.channel_id, event.author.id)
    }

    eventSource.addEventListener(Events.NEW_MESSAGE, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_MESSAGE, handler)
    }
  }, [
    eventSource,
    mutedCommunities,
    mutedChannels,
    id,
    stopTyping,
    user,
    token,
    autoRead,
    channelID
  ])
}

export default useNewMessage
