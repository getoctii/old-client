import { createContainer } from 'unstated-next'
import { useState, useCallback } from 'react'
// some _small brain shit_ lmao BIG BRAIN TIME
const useTyping = () => {
  const [typing, setTyping] = useState<{ [key: string]: any[] }>({})

  const stopTyping = useCallback((channel: string, id: string) => {
    setTyping((state) => {
      return {
        ...state,
        [channel]: state[channel]?.filter((u) => u[0] !== id) ?? []
      }
    })
  }, [])
  const startTyping = useCallback(
    (channel: string, id: string, username: string) => {
      setTyping((state) => {
        if (!state[channel]?.find((e) => e[0] === id)) {
          return {
            ...state,
            [channel]: [...(state[channel] ?? []), [id, username]]
          }
        } else {
          return state
        }
      })
      setTimeout(() => {
        stopTyping(channel, id)
      }, 7000)
    },
    [stopTyping]
  )
  return {
    startTyping,
    stopTyping,
    typing
  }
}

export default createContainer(useTyping)
