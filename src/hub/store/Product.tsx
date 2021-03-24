import Button from '../../components/Button'
import styles from './Product.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBadgeCheck,
  faChevronCircleLeft
} from '@fortawesome/pro-duotone-svg-icons'
import Header from '../../components/Header'
import { useHistory } from 'react-router-dom'

const Product = () => {
  const history = useHistory()
  return (
    <div className={styles.product}>
      <Header
        icon={faChevronCircleLeft}
        heading={'Points'}
        subheading={'Store'}
        className={styles.backHeader}
        color={'secondary'}
        onClick={() => history.push('/hub/store')}
      />
      <img
        className={styles.banner}
        src='https://file.coffee/u/DlX3tED6S3.png'
        alt='Points'
      />
      <div className={styles.main}>
        <div className={styles.info}>
          <h1>
            Points
            <FontAwesomeIcon className={styles.badge} icon={faBadgeCheck} />
          </h1>
          <h2>A simple & clean economy bot</h2>
          <p>
            Reward members for being active and participating in your server
            through message points. Host your own economy through our banking
            system. Try your luck with dice and coin flip commands. Give out
            cool rewards with the shop. And so much more.
          </p>
        </div>
        <div className={styles.card}>
          <h1>Purchase</h1>
          <Button type='button'>Limited: Free</Button>
          <Button type='button'>Basic: $2.99</Button>
          <Button type='button'>Plus: $5.99</Button>
          <Button type='button'>Ultra: $9.99</Button>
          <p>
            By purchasing this product, you agree to the Octii store TOS. Octii
            takes a 15% cut of all revenue to this developer.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Product
