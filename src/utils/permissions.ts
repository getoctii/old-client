import { useQuery } from 'react-query'
import {
  getCommunity,
  getGroups,
  getMember,
  GroupResponse
} from '../community/remote'
import { Auth } from '../authentication/state'
import { useCallback, useMemo } from 'react'
import { Permissions } from './constants'
import { createContainer } from 'unstated-next'
import { useRouteMatch } from 'react-router-dom'
import { getCommunities } from '../user/remote'

export const getHighestOrder = (groups: GroupResponse[]) => {
  const groupOrders = groups.map((group) => group?.order)
  if (groupOrders.length < 1) return 0
  return groupOrders.reduce((a = 0, b = 0) => (b > a ? b : a)) ?? 0
}

export const useHasPermission = () => {
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const auth = Auth.useContainer()
  const { data: community } = useQuery(
    ['community', match?.params.id, auth.token],
    getCommunity,
    {
      enabled: !!auth.token && !!match?.params.id
    }
  )
  const { data: groupIDs } = useQuery(
    ['groups', match?.params.id, auth.token],
    getGroups,
    {
      enabled: !!auth.token && !!match?.params.id
    }
  )
  const { data: communities } = useQuery(
    ['communities', auth.id, auth.token],
    getCommunities,
    {
      enabled: !!auth.token && !!auth.id
    }
  )
  const { data: member } = useQuery(
    [
      'member',
      communities?.find((c) => c.community.id === match?.params.id)?.id,
      auth.token
    ],
    getMember,
    {
      enabled:
        !!auth.token &&
        !!match?.params.id &&
        communities?.find((c) => c.community.id === match?.params.id)
    }
  )

  const hasPermissions = useCallback(
    (permissions: Permissions[], overrides?: boolean) => {
      return (
        !!member?.permissions.some(
          (permission) =>
            permissions.includes(permission) ||
            (!overrides &&
              (permission === Permissions.ADMINISTRATOR ||
                permission === Permissions.OWNER))
        ) ||
        permissions.some((p) => community?.base_permissions?.includes(p)) ||
        community?.owner_id === auth.id
      )
    },
    [community, auth.id, member?.permissions]
  )

  const protectedGroups = useMemo(() => {
    return community?.owner_id !== auth.id
      ? (groupIDs ?? []).filter((group, index) => {
          if (!groupIDs) return false
          return groupIDs.length - index >= (member?.highest_order ?? 0)
        })
      : []
  }, [groupIDs, member?.highest_order, auth.id, community?.owner_id])
  return { community, hasPermissions, groupIDs, protectedGroups }
}

export const Permission = createContainer(useHasPermission)
