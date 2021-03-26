import { Helmet } from 'react-helmet-async'
import { Redirect, Switch, useRouteMatch } from 'react-router-dom'
import { useMedia } from 'react-use'
import styles from './Hub.module.scss'
import { PrivateRoute } from '../authentication/PrivateRoute'
import Store from './store/Store'
import Product from './store/Product'
import Sideview from '../components/Sideview'
import { faStoreAlt } from '@fortawesome/pro-duotone-svg-icons'
import Friends from './friends/Friends'

const Hub = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { path } = useRouteMatch()
  const match = useRouteMatch('/hub/:page')

  return (
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
          <PrivateRoute path={`${path}/store`} component={Store} exact />
          <PrivateRoute
            path={`${path}/store/:productID`}
            component={Product}
            exact
          />
        </Switch>
      </div>
    </div>
  )
}

export default Hub
