import { clientGateway, Permissions } from '../utils/constants'

export interface Member {
  id: string
  user_id: string
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
  system_channel_id?: string
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

export interface Group {
  id: string
  name: string
  color: string
  permissions: Permissions[]
}

export type Groups = Group[]

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

export const getGroups = async (
  _: string,
  communityID: string,
  token: string
) =>
  (
    await clientGateway.get<Groups>(`/communities/${communityID}/groups`, {
      headers: {
        Authorization: token
      }
    })
  ).data

export const getGroup = async (_: string, groupID: string, token: string) =>
  (
    await clientGateway.get<Group>(`/groups/${groupID}`, {
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
  lastMemberID: string
) =>
  (
    await clientGateway.get<Member[]>(`/communities/${communityID}/members`, {
      headers: { Authorization: token },
      params: { last_member_id: lastMemberID }
    })
  ).data
