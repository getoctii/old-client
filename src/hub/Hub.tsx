import { Helmet } from 'react-helmet-async'
import { Redirect, Switch, useRouteMatch } from 'react-router-dom'
import { useMedia } from 'react-use'
import styles from './Hub.module.scss'
import { PrivateRoute } from '../authentication/PrivateRoute'
import Store from './store/Store'
import Product from './store/Product'
import Sideview from '../components/Sideview'
import { faStoreAlt } from '@fortawesome/free-solid-svg-icons'
import Friends from './friends/Friends'
import StatusBar from '../components/StatusBar'
import { FC } from 'react'

const Hub: FC = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { path } = useRouteMatch()
  const match = useRouteMatch('/hub/:page')

  return (
    <StatusBar sidebar={isMobile}>
      <div className={styles.hub}>
        <Helmet>
          <title>Octii - Hub</title>
        </Helmet>
        {((!match && isMobile) || !isMobile) && (
          <Sideview
            name={'Hub'}
            tabs={[
              {
                name: 'Store',
                icon: faStoreAlt,
                color: 'primary',
                link: '/hub/store'
              }
            ]}
            children={<Friends />}
          />
        )}
        <div className={styles.pages}>
          <Switch>
            {!isMobile && <Redirect path={path} to={`${path}/store`} exact />}
            <PrivateRoute path={`${path}/store`} render={Store} exact />
            <PrivateRoute
              path={`${path}/store/:productID`}
              render={Product}
              exact
            />
          </Switch>
        </div>
      </div>
    </StatusBar>
  )
}

export default Hub
