import { faCogs } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './Products.module.scss'
import Button from '../../components/Button'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { getCommunity, getProduct, getProducts } from '../remote'
import { Auth } from '../../authentication/state'
import Header from '../../components/Header'
import List from '../../components/List'
import Icon from '../../user/Icon'
import { faPlusCircle, faCubes } from '@fortawesome/pro-duotone-svg-icons'
import { useMedia } from 'react-use'
import { UI } from '../../state/ui'
import { ModalTypes } from '../../utils/constants'
import { Suspense } from 'react'

export const ProductCard = ({ id }: { id: string }) => {
  const { id: communityID } = useParams<{ id: string }>()
  const auth = Auth.useContainer()
  const history = useHistory()
  const { data: product } = useQuery(['product', id, auth.token], getProduct)
  return (
    <List.Card
      title={product?.name}
      icon={<Icon avatar={product?.icon} />}
      actions={
        <Button
          type={'button'}
          onClick={() => {
            history.push(`/communities/${communityID}/products/${id}`)
          }}
        >
          <FontAwesomeIcon icon={faCogs} />
        </Button>
      }
    />
  )
}

const Products = () => {
  const ui = UI.useContainer()
  const history = useHistory()
  const { token } = Auth.useContainer()
  const { id } = useParams<{ id: string }>()
  const { data: community } = useQuery(['community', id, token], getCommunity)
  const { data: products } = useQuery(['products', id, token], getProducts)
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <div className={styles.products}>
      <div className={styles.header}>
        <Header
          heading={'Products'}
          subheading={community?.name ?? ''}
          image={community?.icon}
          onBack={() => history.push(`/communities/${id}`)}
        />
        {(products?.length ?? 0) > 0 && (
          <Button
            className={styles.newButton}
            type='button'
            onClick={() => ui.setModal({ name: ModalTypes.NEW_PRODUCT })}
          >
            {isMobile ? (
              <FontAwesomeIcon icon={faPlusCircle} />
            ) : (
              'Create Product'
            )}
          </Button>
        )}
      </div>
      <br />
      <List.View>
        {(products?.length ?? 0) > 0 ? (
          products?.map(
            (product) =>
              product && (
                <Suspense key={product} fallback={<List.CardPlaceholder />}>
                  <ProductCard id={product} />
                </Suspense>
              )
          )
        ) : (
          <List.Empty
            title={'Get started with a new product!'}
            description={
              'Products allow you to create themes, client, and server side integerations, that can be listed on the Octii store.'
            }
            icon={faCubes}
            action={
              <Button
                type='button'
                onClick={() => ui.setModal({ name: ModalTypes.NEW_PRODUCT })}
              >
                Create Product <FontAwesomeIcon icon={faPlusCircle} />
              </Button>
            }
          />
        )}
      </List.View>
    </div>
  )
}

export default Products
