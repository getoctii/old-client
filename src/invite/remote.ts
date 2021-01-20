import { clientGateway } from '../utils/constants'
import { Invite } from '../community/remote'

export const getInvite = async (_: string, code: string, token: string) =>
  (
    await clientGateway.get<Invite>(`/invites/${code}`, {
      headers: {
        Authorization: token
      }
    })
  ).data
