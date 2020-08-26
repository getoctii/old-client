import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import { isPassword } from '../authentication/forms/validations'
import { useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { UI } from '../uiStore'
import { clientGateway } from '../constants'
import Button from '../components/Button'
import { BarLoader } from 'react-spinners'
import styles from './shared.module.scss'
import Input from '../components/Input'

type validateFormData = { newPassword: string, oldPassword: string }

const validatePassword = (values: validateFormData) => {
  const errors: { oldPassword?: string, newPassword?: string } = {}
  if (!isPassword(values.newPassword)) errors.newPassword = 'A valid password is required'
  if (!isPassword(values.oldPassword)) errors.oldPassword = 'A valid password is required'
  return errors
}

type UserResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

const Security = () => {
  const { token, id } = Auth.useContainer()

  return (
    <div className={styles.wrapper}>
      <h2>Security</h2>
      <Formik
        initialValues={{ oldPassword: '', newPassword: '' }}
        validate={validatePassword}
        onSubmit={async (values, { setSubmitting, setErrors }) => {}}
      >
        {({ isSubmitting }) => (
          <Form>
            <h3>Change Password</h3>
            <label htmlFor='oldPassword' className={styles.inputName}>
              Current Password
            </label>
            <Field component={Input} name='oldPassword' type={'password'}/>
            <ErrorMessage component='p' name='oldPassword' />
            <label htmlFor='newPassword' className={styles.inputName}>
              New Password
            </label>
            <Field component={Input} name='newPassword' type={'password'}/>
            <ErrorMessage component='p' name='newPassword' />
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? (
                <BarLoader color='#ffffff' />
              ) : (
                'Change Password'
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default Security
