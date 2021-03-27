import StoreHeader from './StoreHeader'
import Featured from './Featured'
import styles from './Store.module.scss'

const Store = () => {
  return (
    <div className={styles.store}>
      <StoreHeader />

      <Featured />
    </div>
  )
}

export default Store
