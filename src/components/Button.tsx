import { motion } from 'framer-motion'
import React, { CSSProperties } from 'react'
import styles from './Button.module.scss'

type OnClick = (event: any) => void

const Button = ({
  children,
  onClick,
  type,
  disabled = false,
  className,
  style
}: {
  children?: React.ReactNode
  onClick?: OnClick
  type: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  style?: CSSProperties
}) => {
  return (
    <motion.button
      transition={{
        type: 'spring',
        duration: 0.3,
        bounce: 0.5
      }}
      whileHover={{
        scale: 1.025
      }}
      whileTap={{
        scale: 1.05
      }}
      initial={{ scale: 1 }}
      disabled={disabled}
      type={type}
      className={className ? `${className} ${styles.button}` : styles.button}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.button>
  )
}

export default Button
