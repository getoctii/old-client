import React, { useRef, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileUpload, faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { isUsername } from '../utils/validations'
import { useQuery, queryCache } from 'react-query'
import { Auth } from '../authentication/state'
import { clientGateway } from '../utils/constants'
import Button from '../components/Button'
import { BarLoader, MoonLoader } from 'react-spinners'
import styles from './Profile.module.scss'
import Input from '../components/Input'
import axios from 'axios'
import { useMedia } from 'react-use'
import { getUser } from '../user/remote'
import { useHistory } from 'react-router-dom'
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
  const user = useQuery(['users', id, token], getUser)
  const input = useRef<any>(null)
  const [avatar, setAvatar] = useState(user.data?.avatar || '')
  const [isUploading, setIsUploading] = useState(false)
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
          username: user.data?.username || '',
          avatar: user.data?.avatar || '',
          status: user.data?.status || ''
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
              new URLSearchParams({
                ...(values.username !== user.data?.username && {
                  username: values.username
                }),
                avatar: values.avatar,
                status: values.status
              }),
              {
                headers: {
                  authorization: token
                }
              }
            )
            queryCache.invalidateQueries(['users', id])
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
              <div className={styles.avatar}>
                <img src={avatar} alt={user.data?.username} />
                <div className={styles.details}>
                  <p>Recommanded icon size is 100x100</p>
                  <h6>
                    Powered by <a href='https://file.coffee'>file.coffee</a>
                  </h6>
                </div>
                <Button
                  type='button'
                  onClick={() => input.current.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <MoonLoader />
                  ) : (
                    <FontAwesomeIcon icon={faFileUpload} />
                  )}
                </Button>
                <input
                  ref={input}
                  type='file'
                  accept='.jpg, .png, .jpeg, .gif'
                  onChange={async (event) => {
                    setIsUploading(true)
                    const image = event.target.files?.item(0) as any
                    const formData = new FormData()
                    formData.append('file', image)
                    const response = await axios.post(
                      'https://covfefe.innatical.com/api/v1/upload',
                      formData
                    )
                    console.log(response)
                    setIsUploading(false)
                    setAvatar(response.data?.url)
                    setFieldValue('avatar', response.data?.url)
                  }}
                />
              </div>
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
                  user.data?.discriminator === 0
                    ? 'inn'
                    : user.data?.discriminator.toString().padStart(4, '0')
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
                value={user.data?.email}
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
