import React from 'react'
import { SyncLoader } from 'react-spinners'
import styles from './Loader.module.scss'

const Loader = () => {
  return (
    <div className={styles.loader}>
      <SyncLoader />
    </div>
  )
}

export default Loader
