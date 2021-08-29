import Button from '../../components/Button'
import styles from './Product.module.scss'
import { faChevronCircleLeft } from '@fortawesome/free-solid-svg-icons'
import Header from '../../components/Header'
import { useHistory, useParams } from 'react-router-dom'
import { queryCache, useQuery } from 'react-query'
import { Auth } from '../../authentication/state'
import { getProduct } from '../../community/remote'
import { clientGateway } from '../../utils/constants'
import { getPurchases } from '../../user/remote'
import { BarLoader } from 'react-spinners'
import { useState, FC } from 'react'

const Product: FC = () => {
  const auth = Auth.useContainer()
  const history = useHistory()
  const { productID } = useParams<{ productID: string }>()
  const { data: product } = useQuery(
    ['product', productID, auth.token],
    getProduct
  )
  const { data: purchases } = useQuery(
    ['purchases', auth.id, auth.token],
    getPurchases
  )

  const [loading, setLoading] = useState(false)
  return (
    <div className={styles.product}>
      <Header
        icon={faChevronCircleLeft}
        heading={product?.name ?? ''}
        subheading={'Store'}
        className={styles.backHeader}
        color={'secondary'}
        onClick={() => history.push('/hub/store')}
      />
      {product?.banner ? (
        <img
          className={styles.banner}
          src={product?.banner}
          alt={product?.banner}
        />
      ) : (
        <div className={styles.banner} />
      )}
      <div className={styles.main}>
        <div className={styles.info}>
          <h1>{product?.name}</h1>
          <h2>{product?.tagline}</h2>
          <p>{product?.description}</p>
        </div>
        <div className={styles.card}>
          <h1>Purchase</h1>
          <Button
            type='button'
            disabled={loading || !!purchases?.find((p) => p.id === productID)}
            onClick={async () => {
              try {
                setLoading(true)
                await clientGateway.post(
                  `/products/${productID}/purchase`,
                  {},
                  {
                    headers: {
                      Authorization: auth.token
                    }
                  }
                )
                await queryCache.refetchQueries([
                  'purchases',
                  auth.id,
                  auth.token
                ])
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? (
              <BarLoader color='#ffffff' />
            ) : purchases?.find((p) => p.id === productID) ? (
              'Owned'
            ) : (
              'Get'
            )}
          </Button>
          <p>By purchasing this product, you agree to the Octii store TOS.</p>
        </div>
      </div>
    </div>
  )
}

export default Product
