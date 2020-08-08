import React from 'react'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import styles from './shared.module.scss'
import { isEmail, isPassword } from './validations'
import { useMutation } from 'react-query'
import { login } from '../remote'
import { BarLoader } from 'react-spinners'
import { Auth } from '../state'
import { useHistory } from 'react-router-dom'

type formData = { email: string, password: string }

const validate = (values: formData) => {
  const errors: { email?: string, password?: string } = {}
  if (!isEmail(values.email)) errors.email = 'A valid email is required'
  if (!isPassword(values.password)) errors.password = 'A valid password is required'
  return errors
}

export const Login = () => {
  const [ mutate ] = useMutation(login)
  const auth = Auth.useContainer()

  const submit = async (values: formData, { setSubmitting }: FormikHelpers<formData>) => {
    try {
      const response = await mutate(values)
      console.log(response)
      setSubmitting(false)
      localStorage.setItem('neko-token', response.authorization)
      auth.setToken(response.authorization)
    } finally {
    }
  }

  return (
    <Formik initialValues={{ email: '', password: '' }} validate={validate} onSubmit={submit}>
      {({ isSubmitting }) => (
        <Form>
          <label htmlFor='email' className={styles.label}>Email</label>
          <Field className={styles.input} id='email' name='email' type='email'/>
          <ErrorMessage component='p' className={styles.error} name='email'/>

          <label htmlFor='password' className={styles.label}>Password</label>
          <Field className={styles.input} id='password' name='password' type='password'/>
          <ErrorMessage component='p' className={styles.error} name='password'/>
          {/*TODO: Currently at #ffffff for testing, add theming support*/}
          <button className={styles.button} type='submit' disabled={isSubmitting}>{isSubmitting ? <BarLoader color='#ffffff'/> : 'Login'}</button>
        </Form>
      )}
    </Formik>
  )
}