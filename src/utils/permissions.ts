import { useQuery } from 'react-query'
import {
  fetchManyGroups,
  getCommunity,
  getGroups,
  getMemberByUserID,
  GroupResponse
} from '../community/remote'
import { Auth } from '../authentication/state'
import { useCallback } from 'react'
import { Permissions } from './constants'
import { createContainer } from 'unstated-next'
import { useRouteMatch } from 'react-router-dom'

export const getHighestOrder = (groups: GroupResponse[]) => {
  const groupOrders = groups.map((group) => group?.order)
  if (groupOrders.length < 1) return 0
  return groupOrders.reduce((a = 0, b = 0) => (b > a ? b : a))
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

  const { data: groups } = useQuery(
    ['groups', groupIDs ?? [], auth.token],
    fetchManyGroups,
    {
      enabled: !!groupIDs
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
    [memberGroups, community, auth]
  )

  return { community, hasPermissions, memberGroups, groups, groupIDs }
}

export const Permission = createContainer(useHasPermission)
