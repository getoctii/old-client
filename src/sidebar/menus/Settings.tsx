import React from 'react'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import { useQuery } from 'react-query'
import { Auth } from '../../authentication/state'
import { UI } from '../../uiStore'
import styles from './Settings.module.scss'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import Button from '../../components/Button'
import { BarLoader } from 'react-spinners'
import { clientGateway } from '../../constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import { isUsername, isPassword } from '../../authentication/forms/validations'

type UserResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

type profileFormData = { username: string, avatar: string }
type validateFormData = { newPassword: string, oldPassword: string }

const validateProfile = (values: profileFormData) => {
  const errors: { username?: string, avatar?: string } = {}
  if (!isUsername(values.username)) errors.username = 'A valid username is required'
  return errors
}

const validatePassword = (values: validateFormData) => {
  const errors: { oldPassword?: string, newPassword?: string } = {}
  if (!isPassword(values.newPassword)) errors.newPassword = 'A valid password is required'
  if (!isPassword(values.oldPassword)) errors.newPassword = 'A valid password is required'
  return errors
}

const Settings = () => {
  const { token, id } = Auth.useContainer()
  const user = useQuery(
    ['users', id],
    async (key, userID) =>
      (
        await clientGateway.get<UserResponse>(`/users/${userID}`, {
          headers: {
            Authorization: token
          }
        })
      ).data
  )
  const ui = UI.useContainer()
  return (
    <Modal onDismiss={() => ui.setModal('')} fullscreen={true}>
      <div className={styles.settings}>
        <div>
          <h2>Account <span onClick={() => ui.setModal('')}><FontAwesomeIcon icon={faTimesCircle} /></span></h2>
          <Formik
            initialValues={{ username: user.data?.username || '', avatar: user.data?.avatar || '' }}
            validate={validateProfile}
            onSubmit={async (values, { setSubmitting, setErrors }) => {}}
          >
            {({ isSubmitting }) => (
              <Form>
                <label htmlFor='tag' className={styles.inputName}>
                  Username
                </label>
                <Field component={Input} name='username' value={user.data?.username} />
                <ErrorMessage component='p' name='username' />
                <label htmlFor='tag' className={styles.inputName}>
                  Avatar
                </label>
                <Field component={Input} name='avatar' value={user.data?.avatar} />
                <ErrorMessage component='p' name='avatar' />
                <Button disabled={isSubmitting} type='submit'>
                  {isSubmitting ? (
                    <BarLoader color='#ffffff' />
                  ) : (
                    'Save'
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
        <div>
          <Formik
            initialValues={{ oldPassword: '', newPassword: '' }}
            validate={validatePassword}
            onSubmit={async (values, { setSubmitting, setErrors }) => {}}
          >
            {({ isSubmitting }) => (
              <Form>
                <h3>Change Password</h3>
                <label htmlFor='tag' className={styles.inputName}>
                  Current Password
                </label>
                <Field component={Input} name='oldPassword' type={'password'}/>
                <ErrorMessage component='p' name='oldPassword' />
                <label htmlFor='tag' className={styles.inputName}>
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
      </div>
    </Modal>
  )
}

export default Settings
