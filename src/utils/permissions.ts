import { useQuery } from 'react-query'
import {
  fetchManyGroups,
  getCommunity,
  getGroups,
  getMemberByUserID,
  GroupResponse
} from '../community/remote'
import { Auth } from '../authentication/state'
import { useCallback, useMemo } from 'react'
import { Permissions } from './constants'
import { createContainer } from 'unstated-next'
import { useRouteMatch } from 'react-router-dom'

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
      enabled: !!match?.params.id
    }
  )
  const { data: groupIDs } = useQuery(
    ['groups', match?.params.id, auth.token],
    getGroups,
    {
      enabled: !!match?.params.id
    }
  )

  const { data: member } = useQuery(
    ['memberByUserID', match?.params.id, auth.id, auth.token],
    getMemberByUserID,
    {
      enabled: !!match?.params.id
    }
  )
  const { data: memberGroups } = useQuery(
    ['memberGroups', member?.groups ?? [], auth.token],
    fetchManyGroups,
    {
      enabled: !!member
    }
  )

  const hasPermissions = useCallback(
    (permissions: Permissions[], overrides?: boolean) => {
      return (
        !!memberGroups?.some((group) =>
          group.permissions.find(
            (permission) =>
              permissions.includes(permission) ||
              (!overrides &&
                (permission === Permissions.ADMINISTRATOR ||
                  permission === Permissions.OWNER))
          )
        ) || community?.owner_id === auth.id
      )
    },
    [memberGroups, community?.owner_id, auth.id]
  )

  const highestOrder = useMemo(() => getHighestOrder(memberGroups ?? []), [
    memberGroups
  ])
  const protectedGroups = useMemo(() => {
    return community?.owner_id !== auth.id
      ? (groupIDs ?? []).filter((group, index) => {
          if (!groupIDs) return false
          return groupIDs.length - index >= highestOrder
        })
      : []
  }, [groupIDs, highestOrder, auth.id, community?.owner_id])
  return { community, hasPermissions, memberGroups, groupIDs, protectedGroups }
}

export const Permission = createContainer(useHasPermission)
