import { Switch, useRouteMatch } from 'react-router-dom'
import { useMedia } from 'react-use'
import styles from './Product.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Navbar from './Navbar'
import React, { Suspense } from 'react'
import { PrivateRoute } from '../../../authentication/PrivateRoute'
import Overview from './pages/Overview'
import { Settings } from './pages/Settings'
import Resources from './pages/Resources'
import Versions from './pages/Versions'
import Button from '../../../components/Button'
import { faPlusCircle } from '@fortawesome/pro-duotone-svg-icons'
import Header from '../../../components/Header'
import { useQuery } from 'react-query'
import { Auth } from '../../../authentication/state'
import { getProduct } from '../../remote'

const Product = () => {
  const auth = Auth.useContainer()
  const { path } = useRouteMatch()
  const match = useRouteMatch<{
    productID: string
    tab?: string
    id: string
  }>('/communities/:id/products/:productID/:tab?')

  const { data: product } = useQuery(
    ['product', match?.params.productID, auth.token],
    getProduct
  )

  const isMobile = useMedia('(max-width: 740px)')
  return (
    <div className={styles.product}>
      <div className={styles.header}>
        <Header
          heading={'Product'}
          subheading={product?.name ?? ''}
          image={product?.icon}
        />

        {match?.params.tab === 'versions' && (
          <Button className={styles.newButton} type='button'>
            {isMobile ? <FontAwesomeIcon icon={faPlusCircle} /> : 'New Version'}
          </Button>
        )}
      </div>
      <Navbar.View />
      <Suspense fallback={<></>}>
        <Switch>
          <PrivateRoute component={Overview} path={path} exact />
          <PrivateRoute component={Versions} path={`${path}/versions`} exact />
          <PrivateRoute
            component={Resources}
            path={`${path}/resources`}
            exact
          />
          <PrivateRoute component={Settings} path={`${path}/settings`} exact />
        </Switch>
      </Suspense>
    </div>
  )
}

export default Product
