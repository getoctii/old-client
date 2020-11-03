import { clientGateway } from '../constants'

export enum State {
  offline = 'offline',
  idle = 'idle',
  dnd = 'dnd',
  online = 'online'
}

export type UserResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
  state: State
  status: string
  email?: string
}

export const getUser = async (_: string, userID: string, token: string) =>
  (
    await clientGateway.get<UserResponse>(`/users/${userID}`, {
      headers: {
        Authorization: token
      }
    })
  ).data
