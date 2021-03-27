import { faBoxOpen, faReceipt } from '@fortawesome/pro-duotone-svg-icons'
import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Header from '../components/Header'
import List from '../components/List'
import Icon from '../user/Icon'
import { getPurchases } from '../user/remote'
import styles from './Purchases.module.scss'

const Purchases = () => {
  const history = useHistory()
  const auth = Auth.useContainer()
  const { data: purchases } = useQuery(
    ['purchases', auth.id, auth.token],
    getPurchases
  )
  return (
    <div className={styles.purchases}>
      <Header
        heading={'Purchases'}
        icon={faReceipt}
        color={'secondary'}
        subheading='Settings'
        onClick={() => history.push('/settings')}
      />
      <br />
      <List.View>
        {(purchases?.length ?? 0) > 0 ? (
          purchases?.map((purchase) => (
            <List.Card
              className={styles.card}
              title={purchase.name}
              icon={<Icon avatar={purchase.icon} />}
              subtitle={`Build ${purchase.latest_version ?? 0}`}
            />
          ))
        ) : (
          <List.Empty
            icon={faBoxOpen}
            title={'No purchases yet!'}
            description={
              'You can get themes from the store by clicking the button! Anything you get from the store will show up here.'
            }
            action={<Button type='button'>Go to store</Button>}
          />
        )}
      </List.View>
    </div>
  )
}

export default Purchases
