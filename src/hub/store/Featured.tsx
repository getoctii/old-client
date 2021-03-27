import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import { clientGateway } from '../../utils/constants'
import styles from './Featured.module.scss'

const Card = ({
  id,
  name,
  tagline,
  banner,
  icon
}: {
  id: string
  name: string
  tagline: string
  banner?: string
  icon: string
}) => {
  const history = useHistory()
  return (
    <div
      className={styles.card}
      onClick={() => history.push(`/hub/store/${id}`)}
    >
      <img alt={name} src={banner || icon} />
      <div className={styles.content}>
        <h1>{name}</h1>
        <p>{tagline}</p>
      </div>
    </div>
  )
}

const Featured = () => {
  const auth = Auth.useContainer()
  const { data: featured } = useQuery(['featured', auth.token], async () => {
    return (
      await clientGateway.get<
        {
          id: string
          name: string
          tagline: string
          description: string
          banner?: string
          icon: string
        }[]
      >('/products/featured', {
        headers: {
          Authorization: auth.token
        }
      })
    ).data
  })
  return (
    <div className={styles.featured}>
      <h2>Featured</h2>
      <div className={styles.row}>
        {featured?.map((product) => (
          <Card key={product.id} {...product} />
        ))}
      </div>
    </div>
  )
}

export default Featured
