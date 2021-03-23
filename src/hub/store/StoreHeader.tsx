import Input from '../../components/Input'
import styles from './StoreHeader.module.scss'

const StoreHeader = () => {
  return (
    <div className={styles.header}>
      <h1>Welcome to the store!</h1>
      <h2>Level up your experience with extensions</h2>
      <Input placeholder='Find integrations...' />
    </div>
  )
}

export default StoreHeader
