import React, { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Redirect, Switch, useRouteMatch } from 'react-router-dom'
import { useMedia } from 'react-use'
import styles from './Hub.module.scss'
import { PrivateRoute } from '../authentication/PrivateRoute'
import Store from './store/Store'
import Product from './store/Product'
import Sideview from '../components/Sideview'
import {
  faAddressBook,
  faStoreAlt,
  faTerminal
} from '@fortawesome/pro-duotone-svg-icons'
import { useUser } from '../user/state'
import Friends from './friends/Friends'
import { Auth } from '../authentication/state'

const Hub = () => {
  const { id } = Auth.useContainer()
  const isMobile = useMedia('(max-width: 740px)')
  const { path } = useRouteMatch()
  const match = useRouteMatch('/hub/:page')
  const user = useUser(id ?? undefined)
  const tabs = useMemo(() => {
    const items = [
      {
        name: 'innpages',
        icon: faAddressBook,
        color: 'warning',
        link: '/hub/innpages'
      },
      {
        name: 'Store',
        icon: faStoreAlt,
        color: 'primary',
        link: '/hub/store'
      }
    ]
    if (user?.developer)
      items.push({
        name: 'Developer',
        icon: faTerminal,
        color: 'danger',
        link: '/developer'
      })
    return items
  }, [user?.developer])

  return (
    <div className={styles.hub}>
      <Helmet>
        <title>Octii - Hub</title>
      </Helmet>
      {((!match && isMobile) || !isMobile) && (
        <Sideview name={'Hub'} tabs={tabs} children={<Friends />} />
      )}
      <div className={styles.pages}>
        <Switch>
          {!isMobile && <Redirect path={path} to={`${path}/store`} exact />}
          <PrivateRoute path={`${path}/store`} component={Store} exact />
          <PrivateRoute path={`${path}/store/:id`} component={Product} exact />
          <PrivateRoute path={`${path}/developer`} component={Product} exact />
        </Switch>
      </div>
    </div>
  )
}

export default Hub
