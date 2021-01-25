import React from 'react'
import styles from './Input.module.scss'
import { FieldInputProps, FormikFormProps } from 'formik'

const Input = ({
  field,
  form,
  ...props
}: {
  field?: FieldInputProps<string>
  form?: FormikFormProps
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) => {
  return (
    <input
      className={styles.input}
      type='text'
      inputMode={'text'}
      {...field}
      {...props}
    />
  )
}

export default Input
