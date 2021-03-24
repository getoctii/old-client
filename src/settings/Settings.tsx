import React, { useMemo } from 'react'
import Profile from './Profile'
import Security from './Security'
import Themes from './Themes'
import { useMedia } from 'react-use'
import { Redirect, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import { PrivateRoute } from '../authentication/PrivateRoute'
import styles from './Settings.module.scss'
import { Helmet } from 'react-helmet-async'
import { Auth } from '../authentication/state'
import { useUser } from '../user/state'
import {
  faPaintBrush,
  faShield,
  faUser,
  faUserShield
} from '@fortawesome/pro-duotone-svg-icons'
import Sideview from '../components/Sideview'
import { isPlatform } from '@ionic/react'
import GitInfo from 'react-git-info/macro'
import { queryCache } from 'react-query'
import { Plugins } from '@capacitor/core'

const gitInfo = GitInfo()

const Settings = () => {
  const auth = Auth.useContainer()
  const isMobile = useMedia('(max-width: 740px)')
  const { path } = useRouteMatch()
  const match = useRouteMatch('/settings/:page')
  const user = useUser(auth.id ?? undefined)
  const history = useHistory()
  const tabs = useMemo(() => {
    const items = [
      {
        name: 'Profile',
        icon: faUser,
        color: 'primary',
        link: '/settings/profile'
      },
      {
        name: 'Security',
        icon: faShield,
        color: 'secondary',
        link: '/settings/security'
      },
      {
        name: 'Themes',
        icon: faPaintBrush,
        color: 'warning',
        link: '/settings/themes'
      }
    ]
    if (user?.discriminator === 0)
      items.push({
        name: 'Admin',
        icon: faUserShield,
        color: 'danger',
        link: '/admin'
      })
    return items
  }, [user?.discriminator])

  return (
    <div className={styles.settings}>
      <Helmet>
        <title>Octii - Settings</title>
      </Helmet>
      {((!match && isMobile) || !isMobile) && (
        <Sideview name={'Settings'} tabs={tabs}>
          <div className={styles.info}>
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
        </Sideview>
      )}
      <div className={styles.pages}>
        <Switch>
          {!isMobile && <Redirect path={path} to={`${path}/profile`} exact />}
          <PrivateRoute path={`${path}/profile`} component={Profile} exact />
          <PrivateRoute path={`${path}/security`} component={Security} exact />
          <PrivateRoute path={`${path}/themes`} component={Themes} exact />
        </Switch>
      </div>
    </div>
  )
}

export default Settings
