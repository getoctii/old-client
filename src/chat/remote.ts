import {
  decryptMessage,
  encryptMessage,
  exportEncryptedMessage,
  importEncryptedMessage
} from '@innatical/inncryption'
import {
  ExportedEncryptedMessage,
  Keychain
} from '@innatical/inncryption/dist/types'
import axios from 'axios'
import {
  ChannelPermissions,
  ChannelTypes,
  clientGateway,
  MessageTypes
} from '../utils/constants'

export interface Override {
  allow: ChannelPermissions[]
  deny: ChannelPermissions[]
}

export interface ChannelResponse {
  id: string
  name: string
  color?: string
  description?: string
  type: ChannelTypes
  order: number
  category_id?: string
  community_id?: string
  base_allow?: ChannelPermissions[]
  base_deny?: ChannelPermissions[]
  overrides?: {
    [groupID: string]: Override
  }
  voice_users?: string[]
}

export interface MessageResponse {
  id: string
  author_id: string
  type: MessageTypes
  created_at: string
  updated_at: string
  content?: string
  encrypted_content?: ExportedEncryptedMessage
  self_encrypted_content?: ExportedEncryptedMessage
}

export const getChannel = async (_: string, channelID: string, token: string) =>
  (
    await clientGateway.get<ChannelResponse>(`/channels/${channelID}`, {
      headers: {
        Authorization: token
      }
    })
  ).data

export const postTyping = async (channelID: string, token: string) =>
  (
    await clientGateway.post(`/channels/${channelID}/typing`, undefined, {
      headers: {
        Authorization: token
      }
    })
  ).data

export const postMessage = async (
  channelID: string,
  content: string,
  token: string
) =>
  (
    await clientGateway.post(
      `/channels/${channelID}/messages`,
      { content },
      { headers: { Authorization: token } }
    )
  ).data

export const postEncryptedMessage = async (
  channelID: string,
  content: string,
  token: string,
  keychain: Keychain,
  publicKey: CryptoKey
) => {
  const selfEncryptedMessage = exportEncryptedMessage(
    await encryptMessage(
      keychain,
      keychain.encryptionKeyPair.publicKey,
      content
    )
  )
  const encryptedMessage = exportEncryptedMessage(
    await encryptMessage(keychain, publicKey, content)
  )
  return (
    await clientGateway.post(
      `/channels/${channelID}/messages`,
      {
        encrypted_content: encryptedMessage,
        self_encrypted_content: selfEncryptedMessage
      },
      { headers: { Authorization: token } }
    )
  ).data
}

export const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post<{ file: string }>(
    'https://innstor.innatical.com',
    formData
  )
  console.log(response.data)
  return response.data.file
}

export const patchMessage = async (
  messageID: string,
  content: string,
  token: string
) =>
  (
    await clientGateway.patch(
      `/messages/${messageID}`,
      { content },
      { headers: { Authorization: token } }
    )
  ).data

export const patchEncryptedMessage = async (
  messageID: string,
  content: string,
  token: string,
  keychain: Keychain,
  publicKey: CryptoKey
) => {
  const selfEncryptedMessage = exportEncryptedMessage(
    await encryptMessage(
      keychain,
      keychain.encryptionKeyPair.publicKey,
      content
    )
  )
  const encryptedMessage = exportEncryptedMessage(
    await encryptMessage(keychain, publicKey, content)
  )
  return (
    await clientGateway.patch(
      `/messages/${messageID}`,
      {
        encrypted_content: encryptedMessage,
        self_encrypted_content: selfEncryptedMessage
      },
      { headers: { Authorization: token } }
    )
  ).data
}

export const getMessages = async (
  _: string,
  channelID: string,
  token: string,
  lastMessageID: string
) =>
  (
    await clientGateway.get<MessageResponse[]>(
      `/channels/${channelID}/messages`,
      {
        headers: { Authorization: token },
        params: { last_message_id: lastMessageID }
      }
    )
  ).data

export const getMessageContent = async (
  _: string,
  content?: string | ExportedEncryptedMessage | null,
  signing?: CryptoKey | null,
  keychain?: Keychain | null
) => {
  if (typeof content === 'string') {
    return content
  } else {
    if (!signing || !keychain || !content) return ''
    console.log('uwu', signing, keychain, content)
    const decrypted = await decryptMessage(
      keychain,
      signing,
      importEncryptedMessage(content)
    )

    if (decrypted.verified) {
      return decrypted.message
    } else {
      return '*The sender could not be verified...*'
    }
  }
}
