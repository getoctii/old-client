import { useState, useEffect, useCallback } from 'react'
import { createContainer } from '@innatical/innstate'
import { Auth } from '../authentication/state'
import { postMessage, postEncryptedMessage } from './remote'
import { Keychain } from '../keychain/state'

interface UploadDetails {
  status: 'uploading' | 'uploaded' | 'pending'
  file: File
}

const useChat = () => {
  const { token } = Auth.useContainer()
  const [tracking, setTracking] = useState(true)
  const [autoRead, setAutoRead] = useState(false)
  const [channelID, setChannelID] = useState<string | undefined>()
  const [
    publicEncryptionKey,
    setPublicEncryptionKey
  ] = useState<CryptoKey | null>()
  const [publicSigningKey, setPublicSigningKey] = useState<CryptoKey | null>()
  const [uploadDetails, setUploadDetails] = useState<UploadDetails | null>(null)
  const [editingMessageID, setEditingMessageID] = useState<string | undefined>(
    undefined
  )
  const [participants, setParticipants] = useState<string[]>([])
  const { keychain } = Keychain.useContainer()
  const sendMessage = useCallback(
    async (content: string) => {
      if (!token || !channelID) return
      if (publicEncryptionKey)
        await postEncryptedMessage(
          channelID,
          content,
          token,
          keychain!,
          publicEncryptionKey
        )
      else await postMessage(channelID, content, token)
      if (tracking) setAutoRead(true)
    },
    [token, setAutoRead, tracking, channelID, keychain, publicEncryptionKey]
  )

  useEffect(() => {
    if (!tracking && autoRead) setAutoRead(false)
  }, [tracking, autoRead])

  console.log(publicEncryptionKey, publicSigningKey)

  return {
    tracking,
    setTracking,
    autoRead,
    setAutoRead,
    sendMessage,
    channelID,
    setChannelID,
    uploadDetails,
    setUploadDetails,
    editingMessageID,
    setEditingMessageID,
    participants,
    setParticipants,
    publicEncryptionKey,
    setPublicEncryptionKey,
    publicSigningKey,
    setPublicSigningKey
  }
}

export const Chat = createContainer(useChat)
