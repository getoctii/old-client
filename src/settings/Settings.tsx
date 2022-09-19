import { FC, useMemo } from 'react'
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
  faReceipt,
  faShieldAlt,
  faUser,
  faUserShield
} from '@fortawesome/free-solid-svg-icons'
import Sideview from '../components/Sideview'
// import { isPlatform } from '@ionic/react'
// import GitInfo from 'react-git-info/macro'
import { queryCache } from 'react-query'
import { Plugins } from '@capacitor/core'
import Purchases from './Purchases'
import StatusBar from '../components/StatusBar'
import Status from '../components/Status'

// const gitInfo = GitInfo()

const Settings: FC = () => {
  const auth = Auth.useContainer()
  const isMobile = useMedia('(max-width: 740px)')
  const { path } = useRouteMatch()
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
        icon: faShieldAlt,
        color: 'danger',
        link: '/settings/security'
      },
      {
        name: 'Themes',
        icon: faPaintBrush,
        color: 'warning',
        link: '/settings/themes'
      },
      {
        name: 'Purchases',
        icon: faReceipt,
        color: 'secondary',
        link: '/settings/purchases'
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
    <StatusBar sidebar={isMobile}>
      <div className={styles.settings}>
        <Helmet>
          <title>Octii - Settings</title>
        </Helmet>
        {!isMobile && (
          <Sideview name={'Settings'} tabs={tabs}>
            <div className={styles.info}>
              {/* <p className={styles.buildInfo}>
                {isPlatform('ios') ? 'iOS' : gitInfo.branch || 'stable'}{' '}
                <kbd>{gitInfo.commit.shortHash}</kbd>
              </p> */}
              <Status isClosable={false} />

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
            {!isMobile ? (
              <Redirect path={path} to={`${path}/profile`} exact />
            ) : (
              <PrivateRoute
                path={path}
                exact
                component={() => (
                  <Sideview name={'Settings'} tabs={tabs}>
                    <div className={styles.info}>
                      {/* <p className={styles.buildInfo}>
                        {isPlatform('ios') ? 'iOS' : gitInfo.branch || 'stable'}{' '}
                        <kbd>{gitInfo.commit.shortHash}</kbd>
                      </p> */}
                    </div>
                  </Sideview>
                )}
              />
            )}

            <PrivateRoute path={`${path}/profile`} component={Profile} exact />
            <PrivateRoute
              path={`${path}/security`}
              component={Security}
              exact
            />
            <PrivateRoute path={`${path}/themes`} component={Themes} exact />
            <PrivateRoute
              path={`${path}/purchases`}
              component={Purchases}
              exact
            />
          </Switch>
        </div>
      </div>
    </StatusBar>
  )
}

export default Settings
