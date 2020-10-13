import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Input from '../components/Input'
import Button from '../components/Button'
import styles from './Home.module.scss'
import Tilt from 'react-parallax-tilt'
import { Formik, Form, Field } from 'formik'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/pro-solid-svg-icons'

const Home = () => {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      <div className={styles.heroContainer}>
        <div className={styles.hero}>
          <div>
            <h1>
              Connecting the
              <br />
              world together...
            </h1>
            <h2>Coming Early 2021</h2>
            <Formik
              initialValues={{ email: '' }}
              onValidate={() => {}}
              onSubmit={() => {}}
            >
              {({ isSubmitting }) => (
                <Form className={styles.form}>
                  <label htmlFor='email'>Email</label>
                  <div className={styles.input}>
                    <Field
                      id='email'
                      name='email'
                      type='email'
                      component={Input}
                    />
                    <Button type='submit' disabled={isSubmitting}>
                      <FontAwesomeIcon icon={faBell} />
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          <Tilt className={styles.octii} glareEnable={true}>
            <img src='/OctiiUI.svg' />
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
