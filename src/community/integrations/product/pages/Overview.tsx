import styles from './Overview.module.scss'

const Overview = () => {
  return (
    <div className={styles.cards}>
      <div className={styles.card}>
        <h1>Users</h1>
        <h2>69</h2>
      </div>
      <div className={styles.card}>
        <h1>Revenue</h1>
        <h2>$420</h2>
      </div>

      <div className={styles.card}>
        <h1>Expenses</h1>
        <h2>$56</h2>
      </div>
    </div>
  )
}

export default Overview
