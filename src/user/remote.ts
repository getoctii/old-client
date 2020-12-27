import { clientGateway } from '../utils/constants'

export enum State {
  offline = 'offline',
  idle = 'idle',
  dnd = 'dnd',
  online = 'online'
}

export type Participant = {
  id: string
  conversation: {
    id: string
    channel_id: string
    last_message_id?: string
    participants: string[]
  }
}

export type ParticipantsResponse = Participant[]

export type UserResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
  state: State
  status: string
  email?: string
}

export type Member = {
  id: string
  community: {
    id: string
    name: string
    icon?: string
    large: boolean
  }
}

interface Unreads {
  [key: string]: {
    read: string
    last_message_id: string
  }
}

interface Mentions {
  [key: string]: {
    id: string
    message_id: string
    read: boolean
  }[]
}

export type MembersResponse = Member[]

export const getUser = async (_: string, userID: string, token: string) =>
  (
    await clientGateway.get<UserResponse>(`/users/${userID}`, {
      headers: {
        Authorization: token
      }
    })
  ).data

export const getCommunities = async (
  _: string,
  userID: string,
  token: string
) =>
  (
    await clientGateway.get<MembersResponse>(`/users/${userID}/members`, {
      headers: {
        Authorization: token
      }
    })
  ).data

export const getParticipants = async (
  _: string,
  userID: string,
  token: string
) =>
  (
    await clientGateway.get<ParticipantsResponse>(
      `/users/${userID}/participants`,
      {
        headers: {
          Authorization: token
        }
      }
    )
  ).data

export const getUnreads = async (_: string, userID: string, token: string) =>
  (
    await clientGateway.get<Unreads>(`/users/${userID}/read`, {
      headers: {
        Authorization: token
      }
    })
  ).data

export const getMentions = async (_: string, userID: string, token: string) =>
  (
    await clientGateway.get<Mentions>(`/users/${userID}/mentions`, {
      headers: {
        Authorization: token
      }
    })
  ).data
