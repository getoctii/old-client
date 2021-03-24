import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import React, { Suspense } from 'react'
import { Redirect, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import { PrivateRoute } from '../../authentication/PrivateRoute'
import styles from './Organization.module.scss'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Navbar from './Navbar'
import Products from './Products'

const Organization = () => {
  const { path } = useRouteMatch()
  const history = useHistory()
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <div className={styles.orgnaization}>
      <div className={styles.header}>
        {isMobile ? (
          <div
            className={styles.icon}
            onClick={() => isMobile && history.push(`/developer`)}
          >
            <FontAwesomeIcon
              className={styles.backButton}
              icon={faChevronLeft}
            />
          </div>
        ) : (
          <div
            className={styles.icon}
            style={{
              backgroundImage: `url('https://file.coffee/u/LXJF3kApjb.png')`
            }}
          />
        )}
        <div className={styles.title}>
          <small>Organization</small>
          <h2>Pornhub</h2>
        </div>
      </div>
      <Navbar.View />
      <Suspense fallback={<></>}>
        <Switch>
          {!isMobile && <Redirect path={path} to={`${path}/products`} exact />}
          <PrivateRoute path={`${path}/products`} component={Products} exact />
        </Switch>
      </Suspense>
    </div>
  )
}

export default Organization
