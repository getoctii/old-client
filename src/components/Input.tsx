import React from 'react'
import styles from './Input.module.scss'
import { FieldInputProps } from 'formik'

const Input = ({ field, ...props }: { field: FieldInputProps<string> }) => {
  return <input className={styles.input} type="text" {...field} {...props} />
}

export default Input
