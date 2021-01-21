import React from 'react'
import styles from './Sidebar.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faShield,
  faPaintBrush,
  faUserShield
} from '@fortawesome/pro-duotone-svg-icons'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'
import { Plugins } from '@capacitor/core'
import { queryCache, useQuery } from 'react-query'
import { getUser } from '../user/remote'
import GitInfo from 'react-git-info/macro'
import { isPlatform } from '@ionic/react'

const gitInfo = GitInfo()

const Sidebar = () => {
  const auth = Auth.useContainer()
  const history = useHistory()
  const user = useQuery(['users', auth.id, auth.token], getUser)
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
        {user?.data?.discriminator === 0 && (
          <>
            <hr />
            <div
              className={`${styles.tab} ${styles.admin}`}
              onClick={() => history.push('/admin')}
            >
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faUserShield} fixedWidth />
              </div>{' '}
              Admin Panel
            </div>
          </>
        )}
      </div>
      <p className={styles.buildInfo}>
        {isPlatform('ios') ? 'iOS' : gitInfo.branch || 'stable'}{' '}
        <kbd>{gitInfo.commit.shortHash}</kbd>
      </p>
      <div
        className={styles.logout}
        onClick={async () => {
          auth.setToken(null)
          await queryCache.invalidateQueries()
          await Plugins.Storage.clear()
          history.push('/authenticate/login')
        }}
      >
        Logout
      </div>
    </div>
  )
}

export default Sidebar
