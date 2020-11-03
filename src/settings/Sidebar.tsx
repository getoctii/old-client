import React from 'react'
import styles from './Sidebar.module.scss'
import { UI } from '../state/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faShield,
  faPaintBrush
} from '@fortawesome/pro-solid-svg-icons'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'

const Sidebar = () => {
  const ui = UI.useContainer()
  const auth = Auth.useContainer()
  const history = useHistory()

  const match = useRouteMatch<{ page: string }>('/settings/:page')
  return (
    <div className={styles.sidebar}>
      <h2>Settings</h2>
      <div className={styles.list}>
        <div
          className={`${styles.tab} ${styles.profile} ${
            match?.params.page === 'profile' ? styles.selected : ''
          }`}
          onClick={() => history.push('/settings/profile')}
        >
          <div className={styles.icon}>
            <FontAwesomeIcon icon={faUser} fixedWidth />
          </div>{' '}
          Profile
        </div>
        <hr />
        <div
          className={`${styles.tab} ${styles.security} ${
            match?.params.page === 'security' ? styles.selected : ''
          }`}
          onClick={() => history.push('/settings/security')}
        >
          <div className={styles.icon}>
            <FontAwesomeIcon icon={faShield} fixedWidth />
          </div>{' '}
          Security
        </div>
        <hr />
        <div
          className={`${styles.tab} ${styles.themes} ${
            match?.params.page === 'themes' ? styles.selected : ''
          }`}
          onClick={() => history.push('/settings/themes')}
        >
          <div className={styles.icon}>
            <FontAwesomeIcon icon={faPaintBrush} fixedWidth />
          </div>{' '}
          Themes
        </div>
      </div>
      <div
        className={styles.logout}
        onClick={() => {
          localStorage.removeItem('neko-token')
          auth.setToken('')
          ui.setModal('')
          history.push('/authenticate/login')
        }}
      >
        Logout
      </div>
    </div>
  )
}

export default Sidebar
