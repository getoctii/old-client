import React, { useEffect, useState } from 'react'
import { queryCache } from 'react-query'
import { Auth } from './authentication/state'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { CLIENT_GATEWAY_URL, Events } from './constants'
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
  const [eventSource, setEventSource] = useState<EventSourcePolyfill | null>(
    null
  )

  useEffect(() => {
    if (!token) return
    const source = new EventSourcePolyfill(
      CLIENT_GATEWAY_URL + '/events/subscribe',
      {
        headers: {
          Authorization: token
        }
      }
    )

    setEventSource(source)

    return () => {
      source.close()
    }
  }, [token])

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
    }

    eventSource.addEventListener(Events.NEW_MESSAGE, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_MESSAGE, handler)
    }
  }, [eventSource, mutedCommunities, mutedChannels, id, stopTyping])

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

  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const participant = JSON.parse(e.data)
      queryCache.setQueryData('participants', (initial) => {
        if (initial instanceof Array) {
          initial.push(participant)
          return initial
        } else return initial
      })
    }

    eventSource.addEventListener(Events.NEW_PARTICIPANT, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_PARTICIPANT, handler)
    }
  }, [eventSource])

  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const participant = JSON.parse(e.data)
      queryCache.setQueryData('participants', (initial) => {
        if (initial instanceof Array) {
          console.log(initial.filter((p) => p.id !== participant.id))
          return initial.filter((p) => p.id !== participant.id)
        } else return initial
      })
    }

    eventSource.addEventListener(Events.DELETED_PARTICIPANT, handler)

    return () => {
      eventSource?.removeEventListener(Events.DELETED_PARTICIPANT, handler)
    }
  }, [eventSource])

  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const member = JSON.parse(e.data)
      console.log('member', member)
      queryCache.setQueryData(['communities'], (initial) => {
        if (initial instanceof Array) {
          initial.push(member)
          return initial
        } else return initial
      })
    }

    eventSource.addEventListener(Events.NEW_MEMBER, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_MEMBER, handler)
    }
  }, [eventSource])

  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const member = JSON.parse(e.data)
      queryCache.setQueryData(['communities'], (initial: any) => {
        if (initial) {
          return initial.filter((m: any) => m.id !== member.id)
        } else return initial
      })
    }

    eventSource.addEventListener(Events.DELETE_MEMBER, handler)

    return () => {
      eventSource.removeEventListener(Events.DELETE_MEMBER, handler)
    }
  }, [eventSource])

  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
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
    }

    eventSource.addEventListener(Events.NEW_CHANNEL, handler)

    return () => {
      eventSource.removeEventListener(Events.NEW_CHANNEL, handler)
    }
  }, [eventSource, token])

  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
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
    }

    eventSource.addEventListener(Events.DELETE_CHANNEL, handler)

    return () => {
      eventSource.removeEventListener(Events.DELETE_CHANNEL, handler)
    }
  }, [eventSource, token])

  useEffect(() => {
    if (!eventSource) return
    const handler = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as {
        channel_id: string
        user_id: string
        username: string
      }
      startTyping(event.channel_id, event.user_id, event.username)
    }

    eventSource.addEventListener(Events.TYPING, handler)

    return () => {
      eventSource.removeEventListener(Events.TYPING, handler)
    }
  })

  return <></>
}

export default EventSource
