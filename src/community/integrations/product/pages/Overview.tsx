import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { Auth } from '../../../../authentication/state'
import { getProduct } from '../../../remote'
import styles from './Overview.module.scss'

const Overview = () => {
  const { productID } = useParams<{ productID: string }>()
  const auth = Auth.useContainer()
  const { data: product } = useQuery(
    ['product', productID, auth.token],
    getProduct
  )

  return (
    <div className={styles.cards}>
      <div className={styles.card}>
        <h1>Purchases</h1>
        <h2>{product?.purchases ?? 0}</h2>
      </div>
    </div>
  )
}

export default Overview
