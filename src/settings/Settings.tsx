import React from 'react'
import Sidebar from './Sidebar'
import Profile from './Profile'
import Security from './Security'
import Themes from './Themes'
import { useMedia } from 'react-use'
import { Redirect, Switch, useRouteMatch } from 'react-router-dom'
import { PrivateRoute } from '../authentication/PrivateRoute'
import styles from './Settings.module.scss'
import { Helmet } from 'react-helmet-async'

const Settings = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { path } = useRouteMatch()
  const match = useRouteMatch('/settings/:page')
  return (
    <div className={styles.settings}>
      <Helmet>
        <title>Octii - Settings</title>
      </Helmet>
      {!match && isMobile ? <Sidebar /> : !isMobile ? <Sidebar /> : <></>}
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
