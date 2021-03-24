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
        onClick={() =>{}
        }
        className={match?.params.tab === 'products' ? styles.selected : ''}
      >
        Overview
      </li>

      <li
        onClick={() =>{}
        }
        className={match?.params.tab === 'settings' ? styles.selected : ''}
      >
        Versions
      </li>

      <li
        onClick={() =>{}
        }
        className={match?.params.tab === 'settings' ? styles.selected : ''}
      >
        Resources
      </li>

      <li
        onClick={() =>{}
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
