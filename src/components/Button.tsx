import React, { CSSProperties } from 'react'
import styles from './Button.module.scss'

type OnClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void

const Button = ({
  children,
  onClick,
  type,
  disabled = false,
  className,
  style,
  props
}: {
  children?: React.ReactNode
  onClick?: OnClick
  type: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  style?: CSSProperties
  props?: any
}) => {
  return (
    <button
      disabled={disabled}
      type={type}
      className={className ? `${className} ${styles.button}` : styles.button}
      onClick={onClick}
      style={style}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
