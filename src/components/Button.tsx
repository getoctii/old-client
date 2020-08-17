import React from 'react'
import styles from './Button.module.scss'

type OnClick = (event: any) => void

const Button = ({ children, onClick }: { children: React.ReactNode, onClick?: OnClick }) => {
  return (
    <button className={styles.button} onClick={onClick}>
      {children}
    </button>
  )
}

export default Button
