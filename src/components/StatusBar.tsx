import { ReactNode } from 'react'
import styles from './StatusBar.module.scss'

const StatusBar = ({
  children,
  sidebar
}: {
  children: ReactNode
  sidebar?: boolean
}) => {
  return (
    <div className={`${styles.statusBar} ${sidebar ? styles.sidebar : ''}`}>
      {children}
    </div>
  )
}

export default StatusBar
