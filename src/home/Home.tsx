import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Input from '../components/Input'
import Button from '../components/Button'
import styles from './Home.module.scss'
import Tilt from 'react-parallax-tilt'
import { Formik, Form, Field, FormikHelpers, ErrorMessage } from 'formik'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/pro-solid-svg-icons'
import { isEmail } from '../validations'
import { clientGateway } from '../constants'

type formData = { email: string }

const validate = (values: formData) => {
  const errors: { email?: string } = {}
  if (!isEmail(values.email)) errors.email = 'A valid email is required'
  return errors
}

const submit = async (values: formData, { setSubmitting, setFieldError }: FormikHelpers<formData>) => {
  if (!values?.email) {
    !values?.email && setFieldError('email', 'Required')
    return
  }
  try {
    await clientGateway.post('/users/newsletter', new URLSearchParams(values))
  } finally {
    setSubmitting(false)
  }
}

const Home = () => {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      <div className={styles.heroContainer}>
        <div className={styles.hero}>
          <div>
            <h1>
              <span className={styles.simple}>Simple.</span>
              <br />
              <span className={styles.private}>Private.</span>
              <br />
              <span className={styles.extensible}>Extensible.</span>
            </h1>
            <h2>Coming Early 2021</h2>
            <Formik
              initialValues={{ email: '' }}
              onValidate={() => console.log('iwi')}
              onSubmit={() => console.log('owo')}
            >
              {({ isSubmitting }) => (
                <Form className={styles.form}>
                  <label htmlFor='email'>Email</label>
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
                  <ErrorMessage component='p' className={styles.error} name='email' />
                </Form>
              )}
            </Formik>
          </div>
          <Tilt className={styles.octii} glareEnable={true}>
            <img src='/OctiiUI.svg' alt='Octii UI'/>
          </Tilt>
        </div>
      </div>
      {/* how are we gonna do the rectangle now e */}

      {/* <div className={styles.container} /> */}
      <Footer />
    </div>
  )
}

export default Home
