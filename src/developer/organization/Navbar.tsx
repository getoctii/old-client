import { useHistory, useRouteMatch } from 'react-router-dom'
import styles from './Navbar.module.scss'

const NavbarView = () => {
  const match = useRouteMatch<{ tab?: string; id: string }>(
    '/developer/organization/:id/:tab?'
  )
  const history = useHistory()
  return (
    <ul className={styles.navbar}>
      <li
        onClick={() =>
          history.push(`/developer/organization/${match?.params.id}/products`)
        }
        className={match?.params.tab === 'products' ? styles.selected : ''}
      >
        Products
      </li>

      <li
        onClick={() =>
          history.push(`/developer/organization/${match?.params.id}/settings`)
        }
        className={match?.params.tab === 'settings' ? styles.selected : ''}
      >
        Settings
      </li>
    </ul>
  )
}

const NavbarPlaceholder = () => {
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
