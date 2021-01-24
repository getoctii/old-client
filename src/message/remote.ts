import { clientGateway, MessageTypes } from '../utils/constants'

export interface MessageResponse {
  id: string
  created_at: string
  updated_at: string
  content: string
  channel_id: string
  author_id: string
  type: MessageTypes
}

export const getMessage = async (_: string, messageID: string, token: string) =>
  !messageID
    ? undefined
    : (
        await clientGateway.get<MessageResponse>(`/messages/${messageID}`, {
          headers: {
            Authorization: token
          }
        })
      ).data
