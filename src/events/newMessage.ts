import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache, useQuery } from 'react-query'
import { isPlatform } from '@ionic/react'
import Typing from '../state/typing'
import { Plugins } from '@capacitor/core'
import { Events, MessageTypes } from '../utils/constants'
import { Auth } from '../authentication/state'
import {
  getKeychain,
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
import { Keychain } from '../keychain/state'
import {
  decryptMessage,
  importEncryptedMessage,
  importPublicKey
} from '@innatical/inncryption'
import { ExportedEncryptedMessage } from '@innatical/inncryption/dist/types'

interface Message {
  self_encrypted_content: ExportedEncryptedMessage
  encrypted_content: ExportedEncryptedMessage
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
    inntronNotify?: (title: string, body: string) => Promise<null>
    inntronType?: 'native' | 'cross'
    inntronPlatform?: 'macos' | 'windows' | 'linux'
  }
}

const useNewMessage = (eventSource: EventSourcePolyfill | null) => {
  const { autoRead, channelID } = Chat.useContainerSelector(
    ({ autoRead, channelID }) => ({
      autoRead,
      channelID
    })
  )
  const { id, token } = Auth.useContainer()
  const { stopTyping } = Typing.useContainer()
  const [mutedCommunities] = useSuspenseStorageItem<string[]>(
    'muted-communities',
    []
  )
  const [mutedChannels] = useSuspenseStorageItem<string[]>('muted-channels', [])
  const user = useQuery(['users', id, token], getUser)
  const { keychain } = Keychain.useContainer()
  useEffect(() => {
    if (!eventSource) return
    const handler = async (e: MessageEvent) => {
      const event = JSON.parse(e.data) as Message
      log('Events', 'purple', 'NEW_MESSAGE')

      queryCache.setQueryData<MessageResponse>(['message', event.id, token], {
        ...event,
        author_id: event.author.id
      })

      const participants = queryCache.getQueryData<ParticipantsResponse>([
        'participants',
        id,
        token
      ])

      const otherKeychain = await queryCache.fetchQuery(
        ['keychain', event.author.id, token],
        getKeychain,
        {
          staleTime: Infinity
        }
      )

      const publicKey = await queryCache.fetchQuery(
        ['publicKey', otherKeychain?.signing.publicKey],
        async (_: string, key: number[]) => {
          if (!key) return undefined
          return await importPublicKey(key, 'signing')
        },
        {
          staleTime: Infinity
        }
      )

      const content = await queryCache.fetchQuery(
        [
          'messageContent',
          event?.content ??
            (event?.author.id === id
              ? event.self_encrypted_content
              : event?.encrypted_content),
          publicKey,
          keychain
        ],
        async () => {
          const content =
            event?.content ??
            (event?.author.id === id
              ? event.self_encrypted_content
              : event?.encrypted_content)
          if (typeof content === 'string') {
            return content
          } else {
            if (!publicKey || !keychain || !content) return ''
            try {
              const decrypted = await decryptMessage(
                keychain,
                publicKey,
                importEncryptedMessage(content)
              )

              if (decrypted.verified) {
                return decrypted.message
              } else {
                return '*The sender could not be verified...*'
              }
            } catch {
              return '*Message could not be decrypted*'
            }
          }
        }
      )

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

      if (
        event.author.id !== id &&
        !mutedCommunities?.includes(event.community_id ?? '') &&
        !mutedChannels?.includes(event.channel_id) &&
        user.data?.state !== State.dnd
      ) {
        const output = parseMarkdown(content, {
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
            const { granted } =
              await Plugins.LocalNotifications.requestPermission()
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
    channelID,
    keychain
  ])
}

export default useNewMessage
