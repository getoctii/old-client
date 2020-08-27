import React from 'react'
import styles from './Modal.module.scss'

const Modal = ({
  children,
  onDismiss,
  fullscreen
}: {
  children: React.ReactNode
  onDismiss?: any,
  fullscreen?: boolean
}) => {
  return (
    <div className={`${styles.modal} ${fullscreen ? styles.fullscreen : ''}`}>
      <div className={styles.background} onClick={onDismiss}></div>
      <div className={styles.content}>{children}</div>
    </div>
  )
}

export default Modal
