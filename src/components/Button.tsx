import React from 'react'
import styles from './Button.module.scss'

type OnClick = (event: any) => void

const Button = ({
  children,
  onClick,
  type,
  disabled = false
}: {
  children: React.ReactNode
  onClick?: OnClick
  type: 'button' | 'submit' | 'reset'
  disabled?: boolean
}) => {
  return (
    <button
      disabled={disabled}
      type={type}
      className={styles.button}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
