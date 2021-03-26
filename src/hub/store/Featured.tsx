import { useHistory } from 'react-router-dom'
import styles from './Featured.module.scss'

const Card = () => {
  const history = useHistory()
  return (
    <div
      className={styles.card}
      onClick={() => history.push('/hub/store/points')}
    >
      <img alt='points' src='https://file.coffee/u/fGpSBEutgA.png' />
      <div className={styles.content}>
        <h1>Points</h1>
        <p>A simple and clean points bot</p>
      </div>
    </div>
  )
}
const cards = [{}, {}, {}, {}, {}]
const Featured = () => {
  return (
    <div className={styles.featured}>
      <h2>Featured</h2>
      <div className={styles.row}>
        {cards.map((_, index) => (
          <Card key={index} />
        ))}
      </div>
    </div>
  )
}

export default Featured
