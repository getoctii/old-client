import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { Auth } from '../authentication/state'
import { clientGateway } from '../utils/constants'
import Button from '../components/Button'
import { BarLoader } from 'react-spinners'
import styles from './Security.module.scss'
import Input from '../components/Input'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory } from 'react-router-dom'
import * as Yup from 'yup'

const PasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Too short, password must be at least 8 characters.')
    .max(140, 'Too long, password must be under 140 characters.'),
  oldPassword: Yup.string()
    .min(8, 'Too short, password must be at least 8 characters.')
    .max(140, 'Too long, password must be under 140 characters.')
})

const Security = () => {
  const { token, id } = Auth.useContainer()
  const isMobile = useMedia('(max-width: 740px)')
  const history = useHistory()
  return (
    <div className={styles.security}>
      <h2>
        {isMobile && (
          <div
            className={styles.icon}
            onClick={() => isMobile && history.push('/settings')}
          >
            <FontAwesomeIcon
              className={styles.backButton}
              icon={faChevronLeft}
            />
          </div>
        )}
        Security
      </h2>
      <Formik
        initialValues={{ oldPassword: '', newPassword: '' }}
        validationSchema={PasswordSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await clientGateway.patch(
              `/users/${id}`,
              {
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
              },
              {
                headers: {
                  authorization: token
                }
              }
            )
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <h4>Change Password</h4>
            <div className={styles.password}>
              <label htmlFor='oldPassword' className={styles.inputName}>
                Current Password
              </label>
              <Field component={Input} name='oldPassword' type={'password'} />
              <ErrorMessage
                component='p'
                name='oldPassword'
                className={styles.error}
              />
            </div>
            <div className={styles.password}>
              <label htmlFor='newPassword' className={styles.inputName}>
                New Password
              </label>
              <Field component={Input} name='newPassword' type={'password'} />
              <ErrorMessage
                component='p'
                name='newPassword'
                className={styles.error}
              />
            </div>
            <Button
              disabled={isSubmitting}
              type='submit'
              className={styles.save}
            >
              {isSubmitting ? <BarLoader color='#ffffff' /> : 'Change Password'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default Security
