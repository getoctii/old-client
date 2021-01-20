import React from 'react'
import styles from './Modal.module.scss'
import { motion } from 'framer-motion'

const Modal = ({
  children,
  onDismiss,
  fullscreen,
  className,
  blur
}: {
  children: React.ReactNode
  onDismiss?: () => void
  fullscreen?: boolean
  className?: string
  blur?: boolean
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
        className={`${styles.background} ${blur ? styles.blur : ''}`}
        onClick={onDismiss}
      />
      <motion.div
        {...(!fullscreen && {
          initial: { scale: 0 },
          animate: { scale: 1 },
          transition: {
            type: 'spring',
            duration: 0.25,
            bounce: 0.5
          },
          exit: {
            scale: 0,
            transition: {
              bounce: 0.15,
              duration: 0.25
            }
          }
        })}
        {...(fullscreen && {
          style: { borderRadius: 0 }
        })}
        className={styles.content}
      >
        {fullscreen && <div className={styles.mrpully}/>}
        {children}
      </motion.div>
    </div>
  )
}

export default Modal
