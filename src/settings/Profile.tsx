import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import { isUsername } from '../authentication/forms/validations'
import { useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { UI } from '../uiStore'
import { clientGateway } from '../constants'
import Button from '../components/Button'
import { BarLoader } from 'react-spinners'
import styles from './shared.module.scss'
import Input from '../components/Input'

type profileFormData = { username: string, avatar: string }

const validateProfile = (values: profileFormData) => {
  const errors: { username?: string, avatar?: string } = {}
  if (!isUsername(values.username)) errors.username = 'A valid username is required'
  return errors
}

type UserResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

const Profile = () => {
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

  return (
    <div className={styles.wrapper}>
      <h2>Profile</h2>
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
  )
}

export default Profile
