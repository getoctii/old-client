import { createContainer } from '@innatical/innstate'
import { useCallback, useMemo } from 'react'
import { useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { getRelationships, RelationshipTypes } from '../hub/friends/remote'
import { clientGateway } from '../utils/constants'

const useRelationships = () => {
  const { id, token } = Auth.useContainer()
  const { data: relationships } = useQuery(
    ['relationships', id, token],
    getRelationships
  )

  const incoming = useMemo(
    () =>
      relationships?.filter(
        (relationship) =>
          relationship.type === RelationshipTypes.INCOMING_FRIEND_REQUEST
      ),
    [relationships]
  )

  const outgoing = useMemo(
    () =>
      relationships?.filter(
        (relationship) =>
          relationship.type === RelationshipTypes.OUTGOING_FRIEND_REQUEST
      ),
    [relationships]
  )

  const friends = useMemo(
    () =>
      relationships?.filter(
        (relationship) => relationship.type === RelationshipTypes.FRIEND
      ),
    [relationships]
  )

  const newRelationship = useCallback(
    async (recipientID: string) => {
      await clientGateway.post(
        `/relationships/${recipientID}`,
        {},
        {
          headers: {
            Authorization: token
          }
        }
      )
    },
    [token]
  )

  const deleteRelationship = useCallback(
    async (recipientID: string) => {
      await clientGateway.delete(`/relationships/${recipientID}`, {
        headers: {
          Authorization: token
        }
      })
    },
    [token]
  )

  const lookupRelationship = useCallback(
    (recipientID: string): 'friend' | 'incoming' | 'outgoing' | undefined => {
      if (
        friends?.find(
          (f) => f.recipient_id === recipientID || f.user_id === recipientID
        )
      ) {
        return 'friend'
      } else if (
        incoming?.find(
          (f) => f.recipient_id === recipientID || f.user_id === recipientID
        )
      ) {
        return 'incoming'
      } else if (
        outgoing?.find(
          (f) => f.recipient_id === recipientID || f.user_id === recipientID
        )
      ) {
        return 'outgoing'
      } else {
        return undefined
      }
    },
    [friends, incoming, outgoing]
  )

  return {
    incoming,
    outgoing,
    friends,
    newRelationship,
    deleteRelationship,
    lookupRelationship
  }
}

export const Relationships = createContainer(useRelationships)
