import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import styles from './Navbar.module.scss'
import { Permission } from '../../utils/permissions'
import { Permissions } from '../../utils/constants'

export const Navbar = () => {
  const match = useRouteMatch<{ tab?: string; id: string }>(
    '/communities/:id/settings/:tab?'
  )
  const { hasPermissions } = Permission.useContainer()
  const history = useHistory()
  return (
    <ul className={styles.navbar}>
      {hasPermissions([Permissions.MANAGE_COMMUNITY]) && (
        <li
          onClick={() =>
            history.push(`/communities/${match?.params.id}/settings/general`)
          }
          className={match?.params.tab === 'general' ? styles.selected : ''}
        >
          General
        </li>
      )}
      {hasPermissions([Permissions.MANAGE_INVITES]) && (
        <li
          onClick={() =>
            history.push(`/communities/${match?.params.id}/settings/invites`)
          }
          className={match?.params.tab === 'invites' ? styles.selected : ''}
        >
          Invites
        </li>
      )}
      {hasPermissions([Permissions.MANAGE_GROUPS]) && (
        <li
          onClick={() =>
            history.push(`/communities/${match?.params.id}/settings/groups`)
          }
          className={match?.params.tab === 'groups' ? styles.selected : ''}
        >
          Groups
        </li>
      )}
    </ul>
  )
}
