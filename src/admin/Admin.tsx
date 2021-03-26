import React, { Suspense, useMemo } from 'react'
import Lookup from './Lookup'
import { useMedia } from 'react-use'
import { Redirect, Switch, useRouteMatch } from 'react-router-dom'
import { PrivateRoute } from '../authentication/PrivateRoute'
import styles from './Admin.module.scss'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { getUser } from '../user/remote'
import Codes from './Codes'
import Newsletters from './Newsletters'
import Sidebar from '../sidebar/Sidebar'
import Sideview from '../components/Sideview'
import {
  faClipboardList,
  faNewspaper,
  faStreetView
} from '@fortawesome/pro-duotone-svg-icons'
import GitInfo from 'react-git-info/macro'
import dayjs from 'dayjs'
import Queue from './store/Queue'

const gitInfo = GitInfo()

const Admin = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { path } = useRouteMatch()
  const match = useRouteMatch<{ page: string }>('/admin/:page')
  const auth = Auth.useContainer()
  const { data: user } = useQuery(['users', auth.id, auth.token], getUser)

  const tabs = useMemo(() => {
    const items = [
      {
        name: 'Lookup',
        icon: faStreetView,
        color: 'primary',
        link: '/admin/lookup'
      },
      {
        name: 'Codes',
        icon: faClipboardList,
        color: 'secondary',
        link: '/admin/codes'
      },
      {
        name: 'Newsletters',
        icon: faNewspaper,
        color: 'warning',
        link: '/admin/newsletters'
      },
      {
        name: 'Queue',
        icon: faClipboardList,
        color: 'danger',
        link: '/admin/queue'
      }
    ]
    return items
  }, [])

  if (user && user.discriminator) throw new Error('InvalidAuthorization')
  return user?.discriminator === 0 ? (
    <>
      {isMobile && !match && <Sidebar />}
      <div className={styles.admin}>
        {((!match && isMobile) || !isMobile) && (
          <Sideview name={'Admin'} tabs={tabs}>
            <p className={styles.buildInfo}>
              <strong>Branch:</strong> <kbd>{gitInfo.branch}</kbd>
              <br />
              <strong>Hash:</strong> <kbd>{gitInfo.commit.shortHash}</kbd>
              <br />
              <strong>Date:</strong>{' '}
              <kbd>{dayjs(gitInfo.commit.date).calendar()}</kbd>
              <br />
              <strong>Message:</strong>
              <br />
              <kbd>{gitInfo.commit.message}</kbd>
            </p>
          </Sideview>
        )}
        <div className={styles.pages}>
          <Suspense fallback={<></>}>
            <Switch>
              {!isMobile && (
                <Redirect path={path} to={`${path}/lookup`} exact />
              )}
              <PrivateRoute path={`${path}/lookup`} component={Lookup} exact />
              <PrivateRoute path={`${path}/codes`} component={Codes} exact />
              <PrivateRoute
                path={`${path}/newsletters`}
                component={Newsletters}
                exact
              />
              <PrivateRoute path={`${path}/queue`} component={Queue} exact />
            </Switch>
          </Suspense>
        </div>
      </div>
    </>
  ) : (
    <></>
  )
}

export default Admin
