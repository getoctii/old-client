import { useEffect } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { queryCache, useQuery } from 'react-query'
import { useLocalStorage } from 'react-use'
import { isPlatform } from '@ionic/react'
import Typing from '../state/typing'
import { Plugins, HapticsNotificationType } from '@capacitor/core'
import { Events } from '../constants'
import { Auth } from '../authentication/state'
import { getUser, State } from '../user/remote'

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

declare global {
  interface Window {
    inntronNotify: undefined | ((title: string, body: string) => Promise<null>)
  }
}

const useNewMessage = (eventSource: EventSourcePolyfill | null) => {
  const { id, token } = Auth.useContainer()
  const { stopTyping } = Typing.useContainer()
  const [mutedCommunities] = useLocalStorage<string[]>('muted_communities', [])
  const [mutedChannels] = useLocalStorage<string[]>('muted_channels', [])
  const user = useQuery(['users', id, token], getUser)
  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const message = JSON.parse(e.data) as Message
      const initial = queryCache.getQueryData(['messages', message.channel_id])
      if (initial instanceof Array) {
        queryCache.setQueryData(
          ['messages', message.channel_id],
          initial[0].length < 25
            ? [[message, ...initial[0]], ...initial.slice(1)]
            : [[message], ...initial]
        )
      }

      if (
        message.author.id !== id &&
        !mutedCommunities?.includes(message.community_id ?? '') &&
        !mutedChannels?.includes(message.channel_id) &&
        user.data?.state !== State.dnd
      ) {
        if (isPlatform('capacitor')) {
          Plugins.Haptics.notification({
            type: HapticsNotificationType.SUCCESS
          })
        }
        if (window.inntronNotify) {
          window.inntronNotify(
            `${
              message.community_name
                ? message.community_name
                : message.author.username
            }${message.channel_name ? ` #${message.channel_name}` : ''}`,
            `${message.community_name ? `${message.author.username}: ` : ''}${
              message.content
            }`
          )
        } else {
          try {
            Plugins.LocalNotifications.requestPermission().then((granted) => {
              if (granted) {
                Plugins.LocalNotifications.schedule({
                  notifications: [
                    {
                      title: `${
                        message.community_name
                          ? message.community_name
                          : message.author.username
                      }${
                        message.channel_name ? ` #${message.channel_name}` : ''
                      }`,
                      body: `${
                        message.community_name
                          ? `${message.author.username}: `
                          : ''
                      }${message.content}`,
                      id: 1
                    }
                  ]
                })
              }
            })
          } catch {
            console.warn('Failed to send notification')
          }
        }
      }
      stopTyping(message.channel_id, message.author.id)
    }

    eventSource.addEventListener(Events.NEW_MESSAGE, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_MESSAGE, handler)
    }
  }, [eventSource, mutedCommunities, mutedChannels, id, stopTyping, user])
}

export default useNewMessage
