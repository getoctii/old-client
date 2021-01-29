import { useQuery } from 'react-query'
import {
  CommunityResponse,
  fetchManyGroups,
  getCommunity,
  getMemberByUserID
} from '../community/remote'
import { Auth } from '../authentication/state'
import { useCallback } from 'react'
import { Permissions } from './constants'

export const useHasPermission = (
  communityID?: string
): [CommunityResponse | undefined, (permissions: Permissions[]) => boolean] => {
  const auth = Auth.useContainer()
  const { data: community } = useQuery(
    ['community', communityID, auth.token],
    getCommunity,
    {
      enabled: !!communityID
    }
  )

  const { data: member } = useQuery(
    ['memberByUserID', communityID, auth.id, auth.token],
    getMemberByUserID,
    {
      enabled: !!communityID
    }
  )
  const { data: groups } = useQuery(
    ['memberGroups', member?.groups ?? [], auth.token],
    fetchManyGroups,
    {
      enabled: !!member
    }
  )

  const hasPermissions = useCallback(
    (permissions: Permissions[]) => {
      return (
        !!groups?.some((group) =>
          group.permissions.find(
            (permission) =>
              permissions.includes(permission) ||
              permission === Permissions.ADMINISTRATOR ||
              permission === Permissions.OWNER
          )
        ) || community?.owner_id === auth.id
      )
    },
    [groups, community, auth]
  )

  return [community, hasPermissions]
}
