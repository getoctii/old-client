import React, { useState } from 'react'
import { BarLoader } from 'react-spinners'
import Button from './Button'
import Modal from './Modal'
import styles from './Update.module.scss'

export const Update = () => {
  const [loading, setLoading] = useState(false)
  return (
    <Modal blur>
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
    </Modal>
  )
}
