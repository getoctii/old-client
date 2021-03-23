import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Redirect, Switch, useRouteMatch } from 'react-router-dom'
import { useMedia } from 'react-use'
import Sidebar from './Sidebar'
import styles from './Hub.module.scss'
import { PrivateRoute } from '../authentication/PrivateRoute'
import Store from './store/Store'

const Hub = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { path } = useRouteMatch()
  const match = useRouteMatch('/settings/:page')
  return (
    <div className={styles.hub}>
      <Helmet>
        <title>Octii - Hub</title>
      </Helmet>
      {!match && isMobile ? <Sidebar /> : !isMobile ? <Sidebar /> : <></>}
      <div className={styles.pages}>
        <Switch>
          {!isMobile && <Redirect path={path} to={`${path}/store`} exact />}
          <PrivateRoute path={`${path}/store`} component={Store} exact />
        </Switch>
      </div>
    </div>
  )
}

export default Hub
