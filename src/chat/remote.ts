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
      new URLSearchParams({ content }),
      { headers: { Authorization: token } }
    )
  ).data

export const uploadFile = async (
  channelID: string,
  file: File,
  token: string
) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(
    'https://covfefe.innatical.com/api/v1/upload',
    formData
  )
  await postMessage(channelID, response.data.url, token)
}
