import { ChannelTypes, clientGateway, Permissions } from '../utils/constants'
import { queryCache } from 'react-query'

export const fetchManyGroups = (_: string, ids: string[], token: string) => {
  return Promise.all(
    ids.map((id) => queryCache.fetchQuery(['group', id, token], getGroup))
  )
}

export interface MemberResponse {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  groups: string[]
  permissions: Permissions[]
  highest_order: number
}

export interface CommunityResponse {
  id: string
  name: string
  icon?: string
  large: boolean
  owner_id?: string
  channels: string[]
  system_channel_id?: string
  base_permissions?: Permissions[]
  organization?: boolean
}

export interface ChannelResponse {
  id: string
  name: string
  description: string
  color: string
  type: ChannelTypes
  parent_id?: string
  order: number
}

export interface InviteResponse {
  id: string
  code: string
  created_at: string
  updated_at: string
  author_id: string
  uses: number
}

export interface GroupResponse {
  id: string
  name: string
  color: string
  order?: number
  permissions: Permissions[]
}

export interface ProductResponse {
  id: string
  name: string
  icon: string
  description: string
  banner?: string
  tagline: string
  purchases: number
}

export enum ResourceTypes {
  THEME = 1,
  CLIENT_INTEGRATION = 2,
  SERVER_INTEGRATION = 3
}

export interface ResourceResponse {
  id: string
  name: string
  type: ResourceTypes
}

export interface VersionResponse {
  name: string
  description: string
  number: number
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

export const getGroups = async (
  _: string,
  communityID: string,
  token: string
) =>
  (
    await clientGateway.get<string[]>(`/communities/${communityID}/groups`, {
      headers: {
        Authorization: token
      }
    })
  ).data?.reverse() ?? []

export const getGroup = async (_: string, groupID: string, token: string) =>
  (
    await clientGateway.get<GroupResponse>(`/groups/${groupID}`, {
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

export const getMember = async (_: string, memberID: string, token: string) =>
  (
    await clientGateway.get<MemberResponse>(`/members/${memberID}`, {
      headers: { Authorization: token }
    })
  ).data

export const getMemberByUserID = async (
  _: string,
  communityID: string,
  userID: string,
  token: string
) =>
  (
    await clientGateway.get<MemberResponse>(
      `/communities/${communityID}/members/${userID}`,
      {
        headers: { Authorization: token }
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
    await clientGateway.get<MemberResponse[]>(
      `/communities/${communityID}/members`,
      {
        headers: { Authorization: token },
        params: { last_member_id: lastMemberID }
      }
    )
  ).data

export const getProducts = async (
  _: string,
  communityID: string,
  token: string
) =>
  (
    await clientGateway.get<string[]>(`/communities/${communityID}/products`, {
      headers: { Authorization: token }
    })
  ).data

export const getProduct = async (_: string, productID: string, token: string) =>
  (
    await clientGateway.get<ProductResponse>(`/products/${productID}`, {
      headers: { Authorization: token }
    })
  ).data

export const getResources = async (
  _: string,
  productID: string,
  token: string
) =>
  (
    await clientGateway.get<string[]>(`/products/${productID}/resources`, {
      headers: { Authorization: token }
    })
  ).data

export const getResource = async (
  _string: string,
  productID: string,
  resourceID: string,
  token: string
) =>
  (
    await clientGateway.get<ResourceResponse>(
      `/products/${productID}/resources/${resourceID}`,
      {
        headers: { Authorization: token }
      }
    )
  ).data

export const getVersions = async (
  _: string,
  productID: string,
  token: string
) =>
  (
    await clientGateway.get<number[]>(`/products/${productID}/versions`, {
      headers: { Authorization: token }
    })
  ).data

export const getVersion = async (
  _string: string,
  productID: string,
  versionID: number,
  token: string
) =>
  (
    await clientGateway.get<VersionResponse>(
      `/products/${productID}/versions/${versionID}`,
      {
        headers: { Authorization: token }
      }
    )
  ).data
