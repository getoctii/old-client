import Button from '../../components/Button'
import styles from './Product.module.scss'
import { faChevronCircleLeft } from '@fortawesome/pro-duotone-svg-icons'
import Header from '../../components/Header'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Auth } from '../../authentication/state'
import { getProduct } from '../../community/remote'
import { clientGateway } from '../../utils/constants'
import { getPurchases } from '../../user/remote'

const Product = () => {
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
        <div className={styles.banner}></div>
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
            disabled={!!purchases?.find((p) => p.id === productID)}
            onClick={async () => {
              await clientGateway.post(
                `/products/${productID}/purchase`,
                {},
                {
                  headers: {
                    Authorization: auth.token
                  }
                }
              )
            }}
          >
            {purchases?.find((p) => p.id === productID) ? 'Owned' : 'Get'}
          </Button>
          <p>By purchasing this product, you agree to the Octii store TOS.</p>
        </div>
      </div>
    </div>
  )
}

export default Product
