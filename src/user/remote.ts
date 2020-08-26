import { clientGateway } from '../constants'
import { Auth } from '../authentication/state'

const { token } = Auth.useContainer()

type UserResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

export default async (_: string, userID: string) => (
  await clientGateway.get<UserResponse>(`/users/${userID}`, {
    headers: {
      Authorization: token
    }
  })
).data
