import { useQuery } from 'react-query'
import {
  getCommunity,
  getGroups,
  getMember,
  GroupResponse
} from '../community/remote'
import { Auth } from '../authentication/state'
import { useCallback, useMemo } from 'react'
import { ChannelPermissions, Permissions } from './constants'
import { createContainer } from 'unstated-next'
import { useRouteMatch } from 'react-router-dom'
import { getCommunities } from '../user/remote'
import { ChannelResponse } from '../chat/remote'

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

  const hasChannelPermissions = useCallback(
    (permissions: ChannelPermissions[], channel: ChannelResponse) => {
      if (
        member?.permissions?.includes(Permissions.ADMINISTRATOR) ||
        member?.permissions?.includes(Permissions.OWNER) ||
        community?.owner_id === auth.id
      )
        return true
      const overrideGroup = Object.entries(
        channel?.overrides ?? {}
      ).find(([groupID]) => member?.groups?.includes(groupID))
      if (overrideGroup) {
        if (
          (overrideGroup[1].allow ?? []).some((permission) =>
            permissions.includes(permission)
          )
        )
          return true

        if (
          (overrideGroup[1].deny ?? []).some((permission) =>
            permissions.includes(permission)
          )
        )
          return false
      }

      if (
        (channel?.base_allow ?? []).some((permission) =>
          permissions.includes(permission)
        )
      )
        return true
      if (
        (channel?.base_deny ?? []).some((permission) =>
          permissions.includes(permission)
        )
      )
        return false

      // @ts-ignore
      return hasPermissions(permissions)
    },
    [
      member?.groups,
      hasPermissions,
      member?.permissions,
      community?.owner_id,
      auth.id
    ]
  )

  const protectedGroups = useMemo(() => {
    return community?.owner_id !== auth.id
      ? (groupIDs ?? []).filter((group, index) => {
          if (!groupIDs) return false
          return groupIDs.length - index >= (member?.highest_order ?? 0)
        })
      : []
  }, [groupIDs, member?.highest_order, auth.id, community?.owner_id])
  return {
    community,
    hasChannelPermissions,
    hasPermissions,
    groupIDs,
    protectedGroups
  }
}

export const Permission = createContainer(useHasPermission)
