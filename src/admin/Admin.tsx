import React from 'react'
import Lookup from './Lookup'
import Sidebar from './Sidebar'
import { useMedia } from 'react-use'
import { Switch, useRouteMatch } from 'react-router-dom'
import { PrivateRoute } from '../authentication/PrivateRoute'
import styles from './Admin.module.scss'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { getUser } from '../user/remote'
import { Codes } from './Codes'
import { Newsletters } from './Newsletters'

const Admin = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { path } = useRouteMatch()
  const match = useRouteMatch('/settings/:page')

  const auth = Auth.useContainer()
  const { data: user } = useQuery(['users', auth.id, auth.token], getUser)
  if (user && user.discriminator ) throw new Error('InvalidAuthorization')
  return user?.discriminator === 0 ? (
    <div className={styles.admin}>
      {!match && isMobile ? <Sidebar /> : !isMobile ? <Sidebar /> : <></>}
      <div className={styles.pages}>
        <Switch>
          <PrivateRoute path={path} component={Lookup} exact />
          <PrivateRoute path={`${path}/codes`} component={Codes} exact />
          <PrivateRoute path={`${path}/newsletters`} component={Newsletters} exact />
        </Switch>
      </div>
    </div>
  ) : <></>
}

export default Admin
