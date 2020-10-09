import React from 'react'
import styles from './Modal.module.scss'
import { motion } from 'framer-motion'

const Modal = ({
  children,
  onDismiss,
  fullscreen,
  className
}: {
  children: React.ReactNode
  onDismiss?: any
  fullscreen?: boolean
  className?: string
}) => {
  return (
    <div
      className={`${styles.modal} ${
        fullscreen ? styles.fullscreen : ''
      } ${className}`}
    >
      <motion.div
        {...(!fullscreen && {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        })}
        className={styles.background}
        onClick={onDismiss}
      ></motion.div>
      <motion.div
        {...(!fullscreen && {
          initial: { scale: 0 },
          animate: { scale: 1 },
          transition: {
            type: 'spring',
            duration: 0.5,
            bounce: 0.5
          },
          exit: {
            scale: 0,
            transition: {
              bounce: 0,
              duration: 0.25
            }
          }
        })}
        className={styles.content}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default Modal
