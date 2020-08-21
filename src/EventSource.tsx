import React, { useEffect } from 'react'
import { queryCache } from 'react-query'
import { Auth } from './authentication/state'
// @ts-ignore
import { EventSourcePolyfill } from 'event-source-polyfill'
import { CLIENT_GATEWAY_URL } from './constants'

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
  const { token } = Auth.useContainer()
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

    eventSource.addEventListener('NEW_MESSAGE', (e: any) => {
      const message = JSON.parse(e.data) as Message
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
        console.log(participant)
        queryCache.setQueryData('participants', (initial) => {
            console.log(initial)
            if (initial instanceof Array) {
                initial.push(participant)
                return initial
            } else return initial
        })
    })

    eventSource.onmessage = (e: any) => console.log(e)

    return () => {
      eventSource.close()
    }
  }, [token])

  return <></>
}

export default EventSource