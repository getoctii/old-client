import React, { useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Input from '../components/Input'
import Button from '../components/Button'
import styles from './Home.module.scss'
import Tilt from 'react-parallax-tilt'
import { Formik, Form, Field, FormikHelpers, ErrorMessage } from 'formik'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/pro-solid-svg-icons'
import { isEmail } from '../utils/validations'
import { clientGateway } from '../utils/constants'
import { useMedia } from 'react-use'

type formData = { email: string }

const validate = (values: formData) => {
  const errors: { email?: string } = {}
  if (!isEmail(values.email)) errors.email = 'A valid email is required'
  return errors
}

const Home = () => {
  const isDarkMode = useMedia('(prefers-color-scheme: dark)')
  const [submitted, setSubmitted] = useState(false)

  const submit = async (
    values: formData,
    { setSubmitting, setFieldError }: FormikHelpers<formData>
  ) => {
    if (!values?.email) {
      !values?.email && setFieldError('email', 'Required')
      return
    }
    try {
      await clientGateway.post('/users/newsletter', new URLSearchParams(values))
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.centered}>
        <Navbar />
        <div className={styles.heroContainer}>
          <div className={styles.hero}>
            <div className={styles.heroLeft}>
              <h1>
                <span>Simple.</span>
                <br />
                <span>Private.</span>
                <br />
                <span>Extensible.</span>
              </h1>
              <h2>Coming Early 2021</h2>
              <Formik
                initialValues={{ email: '' }}
                validate={validate}
                onSubmit={submit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className={styles.form}>
                    <label htmlFor='email'>
                      Enter your email to receive updates.
                    </label>
                    <div className={styles.input}>
                      <Field
                        id='email'
                        name='email'
                        type='text'
                        component={Input}
                      />
                      <Button type='submit' disabled={isSubmitting}>
                        <FontAwesomeIcon icon={faBell} />
                      </Button>
                    </div>
                    {console.log(errors.email)}
                    {errors.email && touched.email ? (
                      <ErrorMessage
                        component='p'
                        className={styles.error}
                        name='email'
                      />
                    ) : submitted ? (
                      <p className={styles.subscribed}>
                        Subscribed! We will email you soon...
                      </p>
                    ) : (
                      <p>We don't spam. Promise.</p>
                    )}
                  </Form>
                )}
              </Formik>
            </div>
            <Tilt className={styles.octii}>
              {isDarkMode ? (
                <img src='/OctiiUI-dark.svg' alt='Octii UI' />
              ) : (
                <img src='/OctiiUI.svg' alt='Octii UI' />
              )}
            </Tilt>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Home
