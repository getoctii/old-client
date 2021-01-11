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

export interface Community {
  id: string
  name: string
  icon: string
  large: boolean
  owner_id: string
  channels: string[]
}

export interface Invite {
  id: string
  code: string
  created_at: string
  updated_at: string
  author_id: string
  uses: number
}

export interface Group {
  id: string
  name: string
  color: string
  permissions: string[]
}

export type Groups = Group[]

export const getCommunity = async (
  _: string,
  communityID: string,
  token: string
) =>
  (
    await clientGateway.get<Community>(`/communities/${communityID}`, {
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

export const getGroup = async (
  _: string,
  communityID: string,
  groupID: string,
  token: string
) =>
  (
    await clientGateway.get<Group>(
      `/communities/${communityID}/groups/${groupID}`,
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
    await clientGateway.get<Invite[]>(`/communities/${communityID}/invites`, {
      headers: {
        Authorization: token
      }
    })
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
