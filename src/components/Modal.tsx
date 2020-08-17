import React from 'react'
import styles from './Modal.module.scss'

const Modal = ({ children, onDismiss }: { children: React.ReactNode, onDismiss?: any }) => {
  return (
    <div className={styles.modal}>
      <div className={styles.background} onClick={onDismiss}></div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}

export default Modal
