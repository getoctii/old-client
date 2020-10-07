import { createContainer } from 'unstated-next'
import { useState } from 'react'

const useTyping = () => {
  const [typing, setTyping] = useState<{ [key: string]: any[] }>({})

  const stopTyping = (channel: string, id: string) => {
    setTyping((state) => {
      return {
        ...state,
        [channel]: state[channel]?.filter((u) => u[0] !== id) ?? []
      }
    })
  }
  const startTyping = (channel: string, id: string, username: string) => {
    if (!typing[channel]?.find((e) => e[0] === id)) {
      setTyping((state) => ({
        ...state,
        [channel]: [...(state[channel] ?? []), [id, username]]
      }))
    }
    setTimeout(() => {
      stopTyping(channel, id)
    }, 7000)
  }
  return {
    startTyping,
    stopTyping,
    typing
  }
}

export default createContainer(useTyping)
