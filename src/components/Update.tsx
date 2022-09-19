import { useState, FC } from 'react'
import { BarLoader } from 'react-spinners'
import Button from './Button'
import styles from './Update.module.scss'

const Update: FC = () => {
  const [loading, setLoading] = useState(false)
  return (
    <div className={styles.update}>
      <h3>Update Available</h3>
      <p>It looks like we found a new update.</p>
      <div>
        <Button
          disabled={loading}
          type='button'
          onClick={() => {
            setLoading(true)
            // @ts-ignore
            window.waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' })
          }}
        >
          {loading ? <BarLoader color='#ffffff' /> : 'Update Now'}
        </Button>
      </div>
    </div>
  )
}

export default Update
