import { State } from '../user/remote'
import { clientGateway } from '../utils/constants'

export interface Member {
  id: string
  user: {
    id: string
    username: string
    avatar: string
    state: State
    status: string
    discriminator: number
  }
  created_at: string
  updated_at: string
}

export interface CommunityResponse {
  id: string
  name: string
  icon?: string
  large: boolean
  owner_id?: string
  channels: string[]
}

export interface ChannelResponse {
  id: string
  name: string
  description: string
  color: string
}

export interface InviteResponse {
  id: string
  code: string
  created_at: string
  updated_at: string
  author_id: string
  uses: number
  community?: {
    id: string
    name: string
    icon: string
    large: boolean
    owner_id: string
  }
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

export const getChannels = async (
  _: string,
  communityID: string,
  token: string
) =>
  (
    await clientGateway.get<ChannelResponse[]>(
      `/communities/${communityID}/channels`,
      {
        headers: {
          Authorization: token
        }
      }
    )
  ).data

export const getInvites = async (
  _: string,
  communityID: string,
  token: string
) =>
  (
    await clientGateway.get<InviteResponse[]>(
      `/communities/${communityID}/invites`,
      {
        headers: {
          Authorization: token
        }
      }
    )
  ).data

export const getMembers = async (
  _: string,
  communityID: string,
  token: string,
  date: string
) =>
  (
    await clientGateway.get<Member[]>(`/communities/${communityID}/members`, {
      headers: { Authorization: token },
      params: { created_at: date }
    })
  ).data
