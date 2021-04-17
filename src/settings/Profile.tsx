import { Formik, Form, Field, ErrorMessage } from 'formik'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { queryCache } from 'react-query'
import { Auth } from '../authentication/state'
import { clientGateway, ModalTypes } from '../utils/constants'
import Button from '../components/Button'
import { BarLoader } from 'react-spinners'
import styles from './Profile.module.scss'
import Input from '../components/Input'
import { useMedia } from 'react-use'
import { useHistory } from 'react-router-dom'
import IconPicker from '../components/IconPicker'
import { useUser } from '../user/state'
import * as Yup from 'yup'
import { UI } from '../state/ui'
import { State, UserResponse } from '../user/remote'

const ProfileSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(16, 'Too long, must be less then 16 characters.'),
  avatar: Yup.string().url(),
  developer: Yup.boolean().optional()
})

const Profile = () => {
  const uiStore = UI.useContainer()
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
          developer: user?.developer || false
        }}
        validationSchema={ProfileSchema}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          if (!values.username) return setFieldError('username', 'Required')
          try {
            await clientGateway.patch(
              `/users/${id}`,
              {
                ...(values.username !== user?.username && {
                  username: values.username
                }),
                ...(values.avatar &&
                  values.avatar !== user?.avatar && {
                    avatar: values.avatar
                  }),
                ...(values.developer &&
                  values.developer !== user?.developer && {
                    developer: values.developer
                  })
              },
              {
                headers: {
                  authorization: token
                }
              }
            )
            queryCache.setQueryData<UserResponse>(
              ['user', id, token],
              (initial) => {
                if (initial) {
                  return {
                    ...initial,
                    username: values.username,
                    avatar: values.avatar,
                    developer: values.developer
                  }
                } else {
                  return {
                    id: id ?? '',
                    username: values.username,
                    discriminator: user?.discriminator ?? 1,
                    state: user?.state ?? State.offline,
                    status: user?.status ?? '',
                    avatar: values.avatar,
                    developer: values.developer
                  }
                }
              }
            )
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
              <ErrorMessage
                component='p'
                name='username'
                className={styles.error}
              />
            </div>
            <div className={styles.discriminator}>
              <ErrorMessage component='p' name='discriminator' />

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
              <ErrorMessage
                component='p'
                name='discriminator'
                className={styles.error}
              />
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
              <ErrorMessage
                component='p'
                name='email'
                className={styles.error}
              />
            </div>
            {!user?.developer && (
              <p
                className={styles.devmode}
                onClick={() => {
                  uiStore.setModal({
                    name: ModalTypes.DEVELOPER_MODE,
                    props: {
                      type: 'developer',
                      onConfirm: async () => {
                        setFieldValue('developer', true)
                        uiStore.clearModal()
                      },
                      onDismiss: () => uiStore.clearModal()
                    }
                  })
                }}
              >
                Enable Developer Mode
              </p>
            )}
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
