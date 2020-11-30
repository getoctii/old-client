import { clientGateway } from '../utils/constants'

export interface Channel {
  id: string
  name: string
  color?: string
  read?: string
  description?: string
  last_message_id?: string
}

export const getChannel = async (_: string, channelID: string, token: string) =>
  (
    await clientGateway.get<Channel>(`/channels/${channelID}`, {
      headers: {
        Authorization: token
      }
    })
  ).data
