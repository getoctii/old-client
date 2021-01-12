import { clientGateway } from '../utils/constants'
import { isTag } from '../utils/validations'

export interface ConversationResponse {
  id: string
  channel_id: string
}

export type FindResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

export type formData = { tag: string }

export const validate = (values: formData) => {
  const errors: { tag?: string } = {}
  console.log(values)
  if (!values.tag || !isTag(values.tag))
    errors.tag = 'A valid username is required'
  return errors
}

export const createConversation = async (
  token: string,
  values: { recipient: string }
) =>
  (
    await clientGateway.post<ConversationResponse>('/conversations', values, {
      headers: { Authorization: token }
    })
  ).data

export const findUser = async (
  token: string | null,
  username: string,
  discriminator: string
) =>
  (
    await clientGateway.get<FindResponse>('/users/find', {
      headers: { Authorization: token },
      params: {
        username: username,
        discriminator: discriminator
      }
    })
  ).data
