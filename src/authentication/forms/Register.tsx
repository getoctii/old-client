import React from 'react'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import styles from './shared.module.scss'
import { isEmail, isPassword, isUsername } from '../../validations'
import { register } from '../remote'
import { BarLoader } from 'react-spinners'
import { Auth } from '../state'

type formData = {
  email: string
  password: string
  username: string
  betaCode: string
}

const validate = (values: formData) => {
  const errors: {
    email?: string
    password?: string
    username?: string
    betaCode?: string
  } = {}
  if (!isEmail(values.email)) errors.email = 'A valid email is required'
  if (!isPassword(values.password))
    errors.password = 'A valid password is required'
  if (!isUsername(values.username))
    errors.username = 'A valid username is required'
  return errors
}

export const Register = () => {
  const auth = Auth.useContainer()

  const submit = async (
    values: formData,
    { setSubmitting, setErrors, setFieldError }: FormikHelpers<formData>
  ) => {
    if (
      !values?.username ||
      !values?.email ||
      !values?.password ||
      !values?.betaCode
    ) {
      !values?.username && setFieldError('username', 'Required')
      !values?.email && setFieldError('email', 'Required')
      !values?.password && setFieldError('password', 'Required')
      !values?.betaCode && setFieldError('betaCode', 'Required')
      return
    }
    try {
      const response = await register(values)
      if (response) {
        localStorage.setItem('neko-token', response.authorization)
        auth.setToken(response.authorization)
      }
    } catch (e) {
      const errors = e.response.data.errors
      const userErrors: { betaCode?: string } = {}
      if (errors.includes('WrongBetaCode'))
        userErrors.betaCode = 'Incorrect Code'
      setErrors(userErrors)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Formik
      initialValues={{ email: '', password: '', username: '', betaCode: '' }}
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
          />
          <ErrorMessage component='p' className={styles.error} name='email' />

          <label htmlFor='username' className={styles.label}>
            Username
          </label>
          <Field
            className={styles.input}
            id='username'
            name='username'
            type='text'
          />
          <ErrorMessage
            component='p'
            className={styles.error}
            name='username'
          />

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

          <label htmlFor='betaCode' className={styles.label}>
            Beta Code
          </label>
          <Field
            className={styles.input}
            id='betaCode'
            name='betaCode'
            type='text'
          />
          <ErrorMessage
            component='p'
            className={styles.error}
            name='betaCode'
          />
          <button
            className={styles.button}
            type='submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? <BarLoader color='#ffffff' /> : 'Register'}
          </button>
        </Form>
      )}
    </Formik>
  )
}
