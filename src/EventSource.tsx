import React, { useEffect } from 'react'
import { queryCache } from 'react-query'
import { Auth } from './authentication/state'
// @ts-ignore
import { EventSourcePolyfill } from 'event-source-polyfill'
import { CLIENT_GATEWAY_URL } from './constants'
import { Plugins, HapticsNotificationType } from '@capacitor/core'
import { isPlatform } from '@ionic/react'

const { Haptics, Toast, LocalNotifications } = Plugins

declare var inntronNotify: undefined | ((title: string, body: string) => Promise<null>)

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
    if (token === null) return
    const eventSource = new EventSourcePolyfill(
      CLIENT_GATEWAY_URL + '/events/subscribe',
      {
        headers: {
          Authorization: token
        }
      }
    )

    eventSource.addEventListener('NEW_MESSAGE', async (e: any) => {
      const message = JSON.parse(e.data) as Message
      if (message.author.id !== id) {
        if (isPlatform('mobile')) {
          Haptics.notification({
            type: HapticsNotificationType.SUCCESS
          })
        }
        Toast.show({
          text: `${message.author.username}: ${message.content}`
        })
        if (inntronNotify) {
          inntronNotify(message.author.username, message.content)
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

    return () => {
      eventSource.close()
    }
  }, [token, id])

  return <></>
}

export default EventSource
