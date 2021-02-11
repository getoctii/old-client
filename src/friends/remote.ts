import { clientGateway } from '../utils/constants'

export enum RelationshipTypes {
  OUTGOING_FRIEND_REQUEST = 1,
  INCOMING_FRIEND_REQUEST = 2,
  FRIEND = 3,
  BLOCKED = 4
}

export interface RelationshipResponse {
  user_id: string
  recipient_id: string
  type: RelationshipTypes
}

export const getRelationships = async (_: string, id: string, token: string) =>
  (
    await clientGateway.get<RelationshipResponse[]>(
      `/users/${id}/relationships`,
      {
        headers: {
          Authorization: token
        }
      }
    )
  ).data
