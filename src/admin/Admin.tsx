import React, { Suspense } from 'react'
import Lookup from './Lookup'
import AdminSidebar from './Sidebar'
import { useMedia } from 'react-use'
import { Redirect, Switch, useRouteMatch } from 'react-router-dom'
import { PrivateRoute } from '../authentication/PrivateRoute'
import styles from './Admin.module.scss'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { getUser } from '../user/remote'
import { Codes } from './Codes'
import { Newsletters } from './Newsletters'
import Sidebar from '../sidebar/Sidebar'

const Admin = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { path } = useRouteMatch()
  const match = useRouteMatch<{ page: string }>('/admin/:page')

  const auth = Auth.useContainer()
  const { data: user } = useQuery(['users', auth.id, auth.token], getUser)
  if (user && user.discriminator ) throw new Error('InvalidAuthorization')
  return user?.discriminator === 0 ? (
    <>
      {isMobile && !match && <Sidebar />}
      <div className={styles.admin}>
        {!match && isMobile ? <AdminSidebar /> : !isMobile ? <AdminSidebar /> : <></>}
        <div className={styles.pages}>
          <Suspense fallback={<></>}>
            <Switch>
              {!isMobile && <Redirect path={path} to={`${path}/lookup`} exact />}
              <PrivateRoute path={`${path}/lookup`} component={Lookup} exact />
              <PrivateRoute path={`${path}/codes`} component={Codes} exact />
              <PrivateRoute path={`${path}/newsletters`} component={Newsletters} exact />
            </Switch>
          </Suspense>
        </div>
      </div>
    </>
  ) : <></>
}

export default Admin
