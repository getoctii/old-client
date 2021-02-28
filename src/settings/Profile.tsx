import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { isUsername } from '../utils/validations'
import { queryCache } from 'react-query'
import { Auth } from '../authentication/state'
import { clientGateway } from '../utils/constants'
import Button from '../components/Button'
import { BarLoader } from 'react-spinners'
import styles from './Profile.module.scss'
import Input from '../components/Input'
import { useMedia } from 'react-use'
import { useHistory } from 'react-router-dom'
import IconPicker from '../components/IconPicker'
import { useUser } from '../user/state'
type profileFormData = { username: string; avatar: string; status: string }

const validateProfile = (values: profileFormData) => {
  const errors: { username?: string; avatar?: string; status?: string } = {}
  if (!isUsername(values.username))
    errors.username = 'A valid username is required'
  if (values.status.length >= 140) errors.status = 'A valid status is required'
  return errors
}

const Profile = () => {
  const { token, id } = Auth.useContainer()
  const user = useUser(id ?? undefined)
  const isMobile = useMedia('(max-width: 740px)')
  const history = useHistory()
  return (
    <div className={styles.profile}>
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
        Profile
      </h2>
      <Formik
        initialValues={{
          username: user?.username || '',
          avatar: user?.avatar || '',
          status: user?.status || ''
        }}
        validate={validateProfile}
        onSubmit={async (
          values,
          { setSubmitting, setErrors, setFieldError }
        ) => {
          if (!values.username) return setFieldError('username', 'Required')
          try {
            await clientGateway.patch(
              `/users/${id}`,
              {
                ...(values.username !== user?.username && {
                  username: values.username
                }),
                avatar: values.avatar,
                status: values.status
              },
              {
                headers: {
                  authorization: token
                }
              }
            )
            await queryCache.invalidateQueries(['users', id])
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <div>
              <label htmlFor='tag' className={styles.inputName}>
                Avatar
              </label>
              <IconPicker
                className={styles.iconPicker}
                alt={user?.username || 'unknown'}
                defaultIcon={user?.avatar}
                onUpload={(url) => {
                  setFieldValue('avatar', url)
                }}
              />
              <ErrorMessage component='p' name='avatar' />
            </div>
            <div className={styles.username}>
              <label htmlFor='tag' className={styles.inputName}>
                Username
              </label>

              <Field component={Input} name='username' />
              <ErrorMessage component='p' name='username' />
            </div>
            <div className={styles.discriminator}>
              <ErrorMessage component='p' name='status' />

              <label htmlFor='tag' className={styles.inputName}>
                Discriminator
              </label>

              <Field
                component={Input}
                name='discriminator'
                value={
                  user?.discriminator === 0
                    ? 'inn'
                    : user?.discriminator.toString().padStart(4, '0')
                }
                disabled
              />
              <ErrorMessage component='p' name='discriminator' />
            </div>
            <div className={styles.discriminator}>
              <ErrorMessage component='p' name='status' />

              <label htmlFor='tag' className={styles.inputName}>
                Email
              </label>

              <Field
                component={Input}
                name='email'
                value={user?.email}
                disabled
              />
              <ErrorMessage component='p' name='email' />
            </div>
            <Button
              disabled={isSubmitting}
              type='submit'
              className={styles.save}
            >
              {isSubmitting ? <BarLoader color='#ffffff' /> : 'Save'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default Profile
