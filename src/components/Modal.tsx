import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, ReactNode } from 'react'
import styles from './Modal.module.scss'

const Modal: FC<{
  onDismiss: () => void
  icon: IconDefinition | FC
  title: string
  subtitle?: string
  children: ReactNode
  bottom?: ReactNode
}> = ({ onDismiss, icon: Icon, title, subtitle, children, bottom }) => {
  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        {typeof Icon === 'function' ? (
          <Icon />
        ) : (
          <div className={styles.icon} onClick={() => onDismiss()}>
            <FontAwesomeIcon icon={Icon} />
          </div>
        )}
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
