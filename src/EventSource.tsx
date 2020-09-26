import React, { useEffect } from 'react'
import { queryCache } from 'react-query'
import { Auth } from './authentication/state'
// @ts-ignore
import { EventSourcePolyfill } from 'event-source-polyfill'
import { CLIENT_GATEWAY_URL } from './constants'
import { Plugins, HapticsNotificationType } from '@capacitor/core'
import { isPlatform } from '@ionic/react'

const { Haptics, Toast, LocalNotifications } = Plugins

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
}

const EventSource = () => {
  const { token, id } = Auth.useContainer()
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
      if (message.author.id !== id) {
        if (isPlatform('capacitor')) {
          Haptics.notification({
            type: HapticsNotificationType.SUCCESS
          })
        }
        Toast.show({
          text: `${message.author.username}: ${message.content}`
        })
        if (window.inntronNotify) {
          window.inntronNotify(message.author.username, message.content)
        } else {
          LocalNotifications.schedule({
            notifications: [
              {
                title: message.author.username,
                body: message.content,
                id: 1
              }
            ]
          })
        }
      }
      queryCache.setQueryData(['messages', message.channel_id], (initial) => {
        if (initial instanceof Array) {
          if (initial[0].length < 25) initial[0].unshift(message)
          else initial.unshift([message])
          return initial
        } else return initial
      })
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

    eventSource.addEventListener('NEW_CHANNEL', (e: any) => {
      const channel = JSON.parse(e.data)
      console.log('channel', channel)
      queryCache.setQueryData(
        ['community', channel.community_id],
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
        ['community', channel.community_id],
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

    return () => {
      eventSource.close()
    }
  }, [token, id])

  return <></>
}

export default EventSource
