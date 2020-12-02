import React from 'react'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import styles from './shared.module.scss'
import { isEmail, isPassword } from '../../utils/validations'
import { login } from '../remote'
import { BarLoader } from 'react-spinners'
import { Auth } from '../state'

type formData = { email: string; password: string }

const validate = (values: formData) => {
  const errors: { email?: string; password?: string } = {}
  if (!isEmail(values.email)) errors.email = 'A valid email is required'
  if (!isPassword(values.password))
    errors.password = 'A valid password is required'
  return errors
}

export const Login = () => {
  const auth = Auth.useContainer()

  const submit = async (
    values: formData,
    { setSubmitting, setErrors, setFieldError }: FormikHelpers<formData>
  ) => {
    if (!values?.email || !values?.password) {
      !values?.email && setFieldError('email', 'Required')
      !values?.password && setFieldError('password', 'Required')
      return
    }
    try {
      const response = await login(values)
      if (response) {
        localStorage.setItem('neko-token', response.authorization)
        auth.setToken(response.authorization)
      }
    } catch (e) {
      const errors = e.response.data.errors
      const userErrors: { email?: string; password?: string } = {}
      if (errors.includes('UserNotFound')) userErrors.email = 'Incorrect Email'
      if (errors.includes('WrongPassword'))
        userErrors.password = 'Incorrect Password'
      setErrors(userErrors)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={validate}
      onSubmit={submit}
    >
      {({ isSubmitting }) => (
        <Form>
          <label htmlFor='email' className={styles.label}>
            Email
          </label>
          <Field
            className={styles.input}
            id='email'
            name='email'
            type='email'
            enterkeyhint='next'
          />
          <ErrorMessage component='p' className={styles.error} name='email' />

          <label htmlFor='password' className={styles.label}>
            Password
          </label>
          <Field
            className={styles.input}
            id='password'
            name='password'
            type='password'
          />
          <ErrorMessage
            component='p'
            className={styles.error}
            name='password'
          />
          {/*TODO: Currently at #ffffff for testing, add theming support*/}
          <button
            className={styles.button}
            type='submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? <BarLoader color='#ffffff' /> : 'Login'}
          </button>
        </Form>
      )}
    </Formik>
  )
}
