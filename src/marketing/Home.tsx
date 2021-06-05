import { FC, useRef, useState } from 'react'
import Input from '../components/Input'
import styles from './Home.module.scss'
import { Formik, Form, Field } from 'formik'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDown,
  faCheck,
  faExclamation
} from '@fortawesome/pro-solid-svg-icons'
import { isEmail } from '../utils/validations'
import { clientGateway } from '../utils/constants'
import { motion } from 'framer-motion'
import { useMedia } from 'react-use'
import Button from '../components/Button'
import { faMegaphone } from '@fortawesome/pro-solid-svg-icons'
import Navbar from './Navbar'
import Footer from './Footer'
import * as Yup from 'yup'

const NewsletterSchema = Yup.object().shape({
  email: Yup.string().email()
})

const Home: FC = () => {
  const prefersDarkMode = useMedia('(prefers-color-scheme: dark)')
  const [submitted, setSubmitted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className={styles.home}>
      <motion.div
        className={styles.hero}
        initial={{ height: '100vh' }}
        animate={{ height: '75vh' }}
        transition={{ duration: 2 }}
      >
        <Navbar />
        <div className={styles.info}>
          <h1>The only chat app you will ever want</h1>
          <p>
            Octii is a chat app focused on simplicity, privacy, and
            extensibility.{' '}
          </p>
          <Formik
            initialValues={{ email: '' }}
            validationSchema={NewsletterSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              if (!values?.email || !isEmail(values?.email)) {
                setFieldError('email', 'Invalid Email')
                return
              }
              try {
                await clientGateway.post('/users/newsletter', values)
                setSubmitted(true)
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {({ values, submitForm, isSubmitting, errors }) => (
              <Form className={styles.form}>
                <label htmlFor='email'>Get Notified for Public Beta</label>
                <div className={styles.input}>
                  <Field
                    id='email'
                    name='email'
                    type='text'
                    component={Input}
                    placeholder={'email'}
                  />
                  {errors.email ? (
                    <Button type='button' className={styles.error}>
                      <FontAwesomeIcon icon={faExclamation} />
                    </Button>
                  ) : !isSubmitting && values.email !== '' && !submitted ? (
                    <Button type='submit' onClick={() => submitForm()}>
                      <FontAwesomeIcon icon={faMegaphone} />
                    </Button>
                  ) : submitted ? (
                    <Button type='button' disabled>
                      <FontAwesomeIcon icon={faCheck} />
                    </Button>
                  ) : (
                    <></>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <motion.div
          className={styles.next}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          onClick={() => {
            ref.current?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <p>Learn More</p>
          <FontAwesomeIcon icon={faArrowDown} />
        </motion.div>
      </motion.div>
      <div className={styles.body} ref={ref}>
        <div className={styles.questions}>
          <div className={styles.question}>
            <h2>
              Great, another chat app.
              <br />
              Why should I sign up?
            </h2>
            <p>
              Octii aims to augment the traditional chat experience using the
              power of integrations. Our integrations will change how you use
              and think about social media, and provide a fluid experience never
              seen before.
            </p>
          </div>
          <div className={styles.question}>
            <h2>What do you mean by integrations?</h2>
            <p>
              Octii integrations let developers create anything they can
              imagine, including themes, games, moderation tools, and other
              experiences. <sup>1</sup>
            </p>
          </div>
          <div className={styles.question}>
            <h2>Hold up, did I hear themes?</h2>
            <p>
              Yes! Octii comes with different themes that you can switch
              between. You can even install themes created by the community from
              our store! <sup>1</sup>
            </p>
          </div>
          <div className={styles.question}>
            <h2>What about my privacy?</h2>
            <p>
              Here at Innatical, we believe that privacy is a fundamental human
              right. We will never track or sell any of your data to any 3rd
              parties. And with our open-source end-to-end encryption for DMs,
              you can be assured that your data is safe with us.{' '}
            </p>
          </div>
          <div className={styles.question}>
            <h2>I’m sold. How do I get started?</h2>
            <p>
              Octii is currently in private beta. If you want a chance to
              receive early access, subscribe to our mailing list!
            </p>
          </div>
          <hr />
          <div className={styles.question}>
            <h2>So, what does it look like?</h2>
            <p>
              Glad you asked, here's a screenshot. <sup>2</sup>
            </p>
          </div>
          {prefersDarkMode ? (
            <picture>
              <source srcSet='/marketing/octii-dark.webp' type='image/webp' />
              <img alt='Octii Screenshot' src='/marketing/octii-dark.png' />
            </picture>
          ) : (
            <picture>
              <source srcSet='/marketing/octii-light.webp' type='image/webp' />
              <img alt='Octii Screenshot' src='/marketing/octii-light.png' />
            </picture>
          )}
          <hr />
          <ol className={styles.disclaimers}>
            <li>Available later this year.</li>
            <li>Subject to change.</li>
          </ol>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Home
