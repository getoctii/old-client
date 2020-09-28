import React, { useRef, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileUpload, faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { isUsername } from '../validations'
import { useQuery, queryCache } from 'react-query'
import { Auth } from '../authentication/state'
import { clientGateway } from '../constants'
import Button from '../components/Button'
import { BarLoader } from 'react-spinners'
import styles from './shared.module.scss'
import Input from '../components/Input'
import axios from 'axios'
import { useMedia } from 'react-use'
type profileFormData = { username: string; avatar: string; status: string }

const validateProfile = (values: profileFormData) => {
  const errors: { username?: string; avatar?: string; status?: string } = {}
  if (!isUsername(values.username))
    errors.username = 'A valid username is required'
  if (values.status.length >= 140) errors.status = 'A valid status is required'
  return errors
}

type UserResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
  status?: string
}

const Profile = ({ setPage }: { setPage: Function }) => {
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
  const input = useRef<any>(null)
  const [avatar, setAvatar] = useState(user.data?.avatar || '')
  const isMobile = useMedia('(max-width: 800px)')
  return (
    <div className={styles.wrapper}>
      <h2 onClick={() => isMobile && setPage('')}>
        {' '}
        {isMobile && (
          <FontAwesomeIcon className={styles.backButton} icon={faChevronLeft} />
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
            <div className={styles.profile}>
              <div>
                <label htmlFor='tag' className={styles.inputName}>
                  Avatar
                </label>
                <div className={styles.avatarContainer}>
                  <img
                    src={avatar}
                    className={styles.avatar}
                    alt={user.data?.username}
                  />
                  <div
                    className={styles.overlay}
                    onClick={() => input.current.click()}
                  >
                    <FontAwesomeIcon icon={faFileUpload} size='2x' />
                  </div>
                  <input
                    ref={input}
                    type='file'
                    accept='.jpg, .png, .jpeg, .gif'
                    onChange={async (event) => {
                      const image = event.target.files?.item(0) as any
                      const formData = new FormData()
                      formData.append('file', image)
                      const response = await axios.post(
                        'https://covfefe.innatical.com/api/v1/upload',
                        formData
                      )
                      console.log(response)
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

                <label htmlFor='tag' className={styles.inputName}>
                  Status
                </label>

                <Field component={Input} name='status' />
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
            </div>

            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? <BarLoader color='#ffffff' /> : 'Save'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default Profile
