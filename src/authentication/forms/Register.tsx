import { FC } from 'react'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import styles from './shared.module.scss'
import { register } from '../remote'
import { BarLoader } from 'react-spinners'
import { Auth } from '../state'
import * as Yup from 'yup'
import { Keychain } from '../../keychain/state'

const RegisterSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email'),
  password: Yup.string()
    .min(8, 'Too short, password must be at least 8 characters.')
    .max(140, 'Too long, password must be under 140 characters.'),
  username: Yup.string()
    .min(3, 'Too short, username must be at least 3 characters.')
    .max(16, 'Too long, username must be under 16 characters.')
    .matches(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric.'),
  betaCode: Yup.string().required('Beta code is required')
})

export const Register: FC = () => {
  const auth = Auth.useContainer()
  const { setKeychainPassword } = Keychain.useContainer()
  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        username: '',
        betaCode: auth.betaCode || ''
      }}
      validationSchema={RegisterSchema}
      onSubmit={async (values, { setSubmitting, setErrors, setFieldError }) => {
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
          if (auth.betaCode) auth.setBetaCode(undefined)
          if (response) {
            auth.setToken(response.authorization)
            setKeychainPassword(values.password)
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
      }}
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
