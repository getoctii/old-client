import { FC } from 'react'
import styles from './StatusBar.module.scss'

const StatusBar: FC<{
  sidebar?: boolean
}> = ({ children, sidebar }) => {
  return (
    <div className={`${styles.statusBar} ${sidebar ? styles.sidebar : ''}`}>
      {children}
    </div>
  )
}

export default StatusBar
