import React, { Suspense, useMemo } from 'react'
import { useMedia } from 'react-use'
import { Redirect, Switch, useRouteMatch } from 'react-router-dom'
import { PrivateRoute } from '../authentication/PrivateRoute'
import styles from './Developer.module.scss'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { getUser } from '../user/remote'
import Sidebar from '../sidebar/Sidebar'
import Sideview from '../components/Sideview'
import { faStreetView } from '@fortawesome/pro-duotone-svg-icons'
import Organizations from './organization/Organizations'
import Organization from './organization/Organization'

const Developer = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { path } = useRouteMatch()
  const match = useRouteMatch<{ page: string }>('/admin/:page')
  const auth = Auth.useContainer()
  const { data: user } = useQuery(['users', auth.id, auth.token], getUser)

  const tabs = useMemo(() => {
    const items = [
      {
        name: 'Overview',
        icon: faStreetView,
        color: 'primary',
        link: '/developer/overview'
      }
    ]
    return items
  }, [])

  return user?.developer ? (
    <>
      {isMobile && !match && <Sidebar />}
      <div className={styles.developer}>
        {((!match && isMobile) || !isMobile) && (
          <Sideview name={'Developer'} tabs={tabs}>
            <Organizations />
          </Sideview>
        )}
        <div className={styles.pages}>
          <Suspense fallback={<></>}>
            <Switch>
              {!isMobile && (
                <Redirect path={path} to={`${path}/lookup`} exact />
              )}
              <PrivateRoute
                path={`${path}/overview`}
                component={() => <></>}
                exact
              />
              <PrivateRoute
                path={`${path}/organization/:id`}
                component={Organization}
              />
            </Switch>
          </Suspense>
        </div>
      </div>
    </>
  ) : (
    <></>
  )
}

export default Developer
