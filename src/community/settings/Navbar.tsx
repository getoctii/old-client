import { FC } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import styles from './Navbar.module.scss'
import { Permission } from '../../utils/permissions'
import { Permissions } from '../../utils/constants'

const NavbarView: FC = () => {
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
      {hasPermissions([Permissions.MANAGE_COMMUNITY]) && (
        <li
          onClick={() =>
            history.push(
              `/communities/${match?.params.id}/settings/integrations`
            )
          }
          className={
            match?.params.tab === 'integrations' ? styles.selected : ''
          }
        >
          Integrations
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

const NavbarPlaceholder: FC = () => {
  return (
    <div className={styles.placeholder}>
      <div className={styles.item} />
      <div className={styles.item} />
      <div className={styles.item} />
    </div>
  )
}

const Navbar = { Placeholder: NavbarPlaceholder, View: NavbarView }

export default Navbar
