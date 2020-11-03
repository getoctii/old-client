import React, { useEffect } from 'react'
import { queryCache } from 'react-query'
import { Auth } from './authentication/state'
// @ts-ignore
import { EventSourcePolyfill } from 'event-source-polyfill'
import { CLIENT_GATEWAY_URL } from './constants'
import { Plugins, HapticsNotificationType } from '@capacitor/core'
import { isPlatform } from '@ionic/react'
import { useLocalStorage } from 'react-use'
import Typing from './state/typing'

const { Haptics, LocalNotifications } = Plugins

declare global {
  interface Window {
    inntronNotify: undefined | ((title: string, body: string) => Promise<null>)
  }
}

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

const EventSource = () => {
  const { token, id } = Auth.useContainer()
  const { startTyping, stopTyping } = Typing.useContainer()
  const [mutedCommunities] = useLocalStorage<string[]>('muted_communities', [])
  const [mutedChannels] = useLocalStorage<string[]>('muted_channels', [])
  useEffect(() => {
    if (!token || !id) return
    const eventSource = new EventSourcePolyfill(
      CLIENT_GATEWAY_URL + '/events/subscribe',
      {
        headers: {
          Authorization: token
        }
      }
    )

    eventSource.onmessage = (e: any) => {
      console.log(e)
    }

    eventSource.addEventListener('NEW_MESSAGE', async (e: any) => {
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
        !mutedChannels?.includes(message.channel_id)
      ) {
        if (isPlatform('capacitor')) {
          Haptics.notification({
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
            LocalNotifications.requestPermission().then((granted) => {
              if (granted) {
                LocalNotifications.schedule({
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
    })

    eventSource.addEventListener('DELETED_MESSAGE', async (e: any) => {
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
    })

    eventSource.addEventListener('NEW_PARTICIPANT', (e: any) => {
      const participant = JSON.parse(e.data)
      queryCache.setQueryData('participants', (initial) => {
        if (initial instanceof Array) {
          initial.push(participant)
          return initial
        } else return initial
      })
    })

    eventSource.addEventListener('DELETED_PARTICIPANT', (e: any) => {
      const participant = JSON.parse(e.data)
      queryCache.setQueryData('participants', (initial) => {
        if (initial instanceof Array) {
          console.log(initial.filter((p) => p.id !== participant.id))
          return initial.filter((p) => p.id !== participant.id)
        } else return initial
      })
    })

    eventSource.addEventListener('NEW_MEMBER', (e: any) => {
      const member = JSON.parse(e.data)
      console.log('member', member)
      queryCache.setQueryData(['communities'], (initial) => {
        if (initial instanceof Array) {
          initial.push(member)
          return initial
        } else return initial
      })
    })

    eventSource.addEventListener('DELETE_MEMBER', (e: any) => {
      const member = JSON.parse(e.data)
      queryCache.setQueryData(['communities'], (initial: any) => {
        if (initial) {
          return initial.filter((m: any) => m.id !== member.id)
        } else return initial
      })
    })

    eventSource.addEventListener('NEW_CHANNEL', (e: any) => {
      const channel = JSON.parse(e.data)
      console.log('channel', channel)
      queryCache.setQueryData(
        ['community', channel.community_id, token],
        (initial: any) => {
          console.log('initial', initial)
          if (initial) {
            initial.channels.push({
              id: channel.id,
              name: channel.name
            })
            return initial
          } else return initial
        }
      )
    })

    eventSource.addEventListener('DELETE_CHANNEL', (e: any) => {
      const channel = JSON.parse(e.data)
      queryCache.setQueryData(
        ['community', channel.community_id, token],
        (initial: any) => {
          if (initial) {
            console.log({
              ...initial,
              channels: initial.channels.filter((c: any) => c.id !== channel.id)
            })
            return {
              ...initial,
              channels: initial.channels.filter((c: any) => c.id !== channel.id)
            }
          } else return initial
        }
      )
    })

    eventSource.addEventListener('TYPING', (e: any) => {
      const event = JSON.parse(e.data) as {
        channel_id: string
        user_id: string
        username: string
      }
      startTyping(event.channel_id, event.user_id, event.username)
    })

    return () => {
      eventSource.close()
    }
  }, [token, id, mutedCommunities, mutedChannels, startTyping, stopTyping])

  return <></>
}

export default EventSource
