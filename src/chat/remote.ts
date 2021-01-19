import axios from 'axios'
import { clientGateway } from '../utils/constants'

export interface Channel {
  id: string
  name: string
  color?: string
  // read?: string
  description?: string
  // last_message_id?: string
  community_id?: string
}

export interface Message {
  id: string
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

export const getChannel = async (_: string, channelID: string, token: string) =>
  (
    await clientGateway.get<Channel>(`/channels/${channelID}`, {
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

export const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(
    'https://covfefe.innatical.com/api/v1/upload',
    formData
  )
  return response.data.url
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

export const getMessages = async (
  _: string,
  channelID: string,
  token: string,
  date: string
) =>
  (
    await clientGateway.get<Message[]>(`/channels/${channelID}/messages`, {
      headers: { Authorization: token },
      params: { created_at: date }
    })
  ).data
