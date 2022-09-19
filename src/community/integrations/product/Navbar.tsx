import { FC } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import styles from './Navbar.module.scss'

const NavbarView: FC = () => {
  const match = useRouteMatch<{ productID: string; tab?: string; id: string }>(
    '/communities/:id/products/:productID/:tab?'
  )
  const history = useHistory()
  return (
    <ul className={styles.navbar}>
      <li
        onClick={() =>
          history.push(
            `/communities/${match?.params.id}/products/${match?.params.productID}`
          )
        }
        className={!match?.params.tab ? styles.selected : ''}
      >
        Overview
      </li>

      <li
        onClick={() =>
          history.push(
            `/communities/${match?.params.id}/products/${match?.params.productID}/versions`
          )
        }
        className={match?.params.tab === 'versions' ? styles.selected : ''}
      >
        Versions
      </li>

      <li
        onClick={() =>
          history.push(
            `/communities/${match?.params.id}/products/${match?.params.productID}/resources`
          )
        }
        className={match?.params.tab === 'resources' ? styles.selected : ''}
      >
        Resources
      </li>

      <li
        onClick={() =>
          history.push(
            `/communities/${match?.params.id}/products/${match?.params.productID}/settings`
          )
        }
        className={match?.params.tab === 'settings' ? styles.selected : ''}
      >
        Settings
      </li>
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
