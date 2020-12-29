import { useState, useEffect, useCallback } from 'react'
import { createContainer } from 'unstated-next'
import { Auth } from '../authentication/state'
import { postMessage } from './remote'

interface UploadDetails {
  status: 'uploading' | 'uploaded' | 'pending'
  file: File
}

const useChat = () => {
  const { token } = Auth.useContainer()
  const [tracking, setTracking] = useState(true)
  const [autoRead, setAutoRead] = useState(false)
  const [channelID, setChannelID] = useState<string | undefined>()
  const [uploadDetails, setUploadDetails] = useState<UploadDetails | null>(null)
  const sendMessage = useCallback(
    async (content: string) => {
      if (!token || !channelID) return
      postMessage(channelID, content, token)
      console.log('hmmmm', tracking)
      if (tracking) setAutoRead(true)
    },
    [token, setAutoRead, tracking, channelID]
  )

  useEffect(() => {
    if (!tracking && autoRead) setAutoRead(false)
  }, [tracking, autoRead])

  return {
    tracking,
    setTracking,
    autoRead,
    setAutoRead,
    sendMessage,
    channelID,
    setChannelID,
    uploadDetails,
    setUploadDetails
  }
}

export const Chat = createContainer(useChat)
