import React from 'react'
import styles from './Input.module.scss'

const Input = ({ name, type, placeholder }: { name: string, type: 'text' | 'color' | 'number', placeholder?: string }) => {
  return (
    <input className={styles.input} type={type} placeholder={placeholder}/>
  )
}

export default Input
