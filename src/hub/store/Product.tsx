import Button from '../../components/Button'
import styles from './Product.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBadgeCheck,
  faChevronCircleLeft
} from '@fortawesome/pro-duotone-svg-icons'
import Header from '../../components/Header'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Auth } from '../../authentication/state'
import { getProduct } from '../../community/remote'
import { clientGateway } from '../../utils/constants'

const Product = () => {
  const auth = Auth.useContainer()
  const history = useHistory()
  const { productID } = useParams<{ productID: string }>()
  const { data: product } = useQuery(
    ['product', productID, auth.token],
    getProduct
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
      <img
        className={styles.banner}
        src='https://file.coffee/u/DlX3tED6S3.png'
        alt={product?.name}
      />
      <div className={styles.main}>
        <div className={styles.info}>
          <h1>
            {product?.name}
            {/* <FontAwesomeIcon className={styles.badge} icon={faBadgeCheck} /> */}
          </h1>
          <h2>Tagline</h2>
          <p>{product?.description}</p>
        </div>
        <div className={styles.card}>
          <h1>Purchase</h1>
          <Button
            type='button'
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
            Get
          </Button>
          <p>By purchasing this product, you agree to the Octii store TOS.</p>
        </div>
      </div>
    </div>
  )
}

export default Product
