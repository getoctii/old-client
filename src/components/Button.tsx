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
    <button
      disabled={disabled}
      type={type}
      className={className ? `${className} ${styles.button}` : styles.button}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  )
}

export default Button
