import { clientGateway } from '../utils/constants'
import { InviteResponse } from '../community/remote'

export const getInvite = async (_: string, code: string, token: string) =>
  (
    await clientGateway.get<InviteResponse>(`/invites/${code}`, {
      headers: {
        Authorization: token
      }
    })
  ).data
