import styles from './Featured.module.scss'

const Card = () => {
  return (
    <div className={styles.card}>
      <img alt='points' src='https://file.coffee/u/fGpSBEutgA.png' />
      <div className={styles.content}>
        <h1>Points</h1>
        <p>A simple and clean points bot</p>
      </div>
    </div>
  )
}

const Featured = () => {
  return (
    <div className={styles.featured}>
      <h2>Featured</h2>
      <div className={styles.row}>
        {new Array(10).fill(null).map(() => (
          <Card></Card>
        ))}
      </div>
    </div>
  )
}

export default Featured
