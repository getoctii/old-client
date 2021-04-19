import { IconDefinition } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, ReactNode } from 'react'
import styles from './Modal.module.scss'

const Modal: FC<{
  onDismiss: () => void
  icon: IconDefinition
  title: string
  subtitle?: string
  children: ReactNode
  bottom?: ReactNode
}> = ({ onDismiss, icon, title, subtitle, children, bottom }) => {
  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <div className={styles.icon} onClick={() => onDismiss()}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className={styles.title}>
          {subtitle && <small>{subtitle}</small>}
          <h2>{title}</h2>
        </div>
      </div>
      <div className={`${styles.body} ${bottom ? styles.bottomBody : ''}`}>
        {children}
      </div>
      {bottom && <div className={styles.bottom}>{bottom}</div>}
    </div>
  )
}

export default Modal
