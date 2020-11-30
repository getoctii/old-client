import { clientGateway } from '../utils/constants'

export interface CommunityChannel {
  last_message_id: string
  name: string
  id: string
  color: string
}

export interface CommunityResponse {
  id: string
  name: string
  icon: string
  large: boolean
  owner_id: string
  channels: CommunityChannel[]
}

export interface Invite {
  id: string
  code: string
  created_at: string
  updated_at: string
  author_id: string
  uses: number
}

export const getCommunity = async (
  _: string,
  communityID: string,
  token: string
) =>
  (
    await clientGateway.get<CommunityResponse>(`/communities/${communityID}`, {
      headers: {
        Authorization: token
      }
    })
  ).data

export const getInvites = async (
  _: string,
  communityID: string,
  token: string
) =>
  (
    await clientGateway.get<Invite[]>(`/communities/${communityID}/invites`, {
      headers: {
        Authorization: token
      }
    })
  ).data
