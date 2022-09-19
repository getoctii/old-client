import { FC, Suspense, useState } from 'react'
import { queryCache, useMutation } from 'react-query'
import { ParticipantsResponse } from '../user/remote'
import { Auth } from '../authentication/state'
import styles from './Lookup.module.scss'
import { Field, Form, Formik } from 'formik'
import { createConversation, findUser, validate } from '../conversation/remote'
import Input from '../components/Input'
import Button from '../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faExclamationCircle,
  faSearch
} from '@fortawesome/free-solid-svg-icons'
import Icon from '../user/Icon'
import { useHistory } from 'react-router-dom'
import { clientGateway } from '../utils/constants'
import { Plugins } from '@capacitor/core'
import { useMedia } from 'react-use'
import { useUser } from '../user/state'

const UserLookup: FC<{ userID: string }> = ({ userID }) => {
  const history = useHistory()
  const auth = Auth.useContainer()
  const user = useUser(userID)
  const [toggleUser] = useMutation(
    async () =>
      (
        await clientGateway.patch(
          `/admin/users/${userID}`,
          {},
          {
            headers: {
              Authorization: auth.token
            }
          }
        )
      ).data,
    {
      onSuccess: async () => {
        await queryCache.invalidateQueries(['users', userID, auth.token])
      }
    }
  )
  return (
    <div className={styles.user}>
      <div className={styles.profile}>
        <Icon avatar={user?.avatar} state={user?.state} />
        <div className={styles.title}>
          <h4>
            {user?.username}#
            {user?.discriminator === 0
              ? 'inn'
              : user?.discriminator.toString().padStart(4, '0')}
          </h4>
          <p>{user?.status || 'No status set'}</p>
        </div>
      </div>
      <div className={styles.details}>
        <p>
          <strong>Email:</strong>{' '}
          <kbd
            onClick={async () =>
              await Plugins.Clipboard.write({ string: user?.email })
            }
          >
            {user?.email}
          </kbd>
        </p>
        <p>
          <strong>ID:</strong>{' '}
          <kbd
            onClick={async () =>
              await Plugins.Clipboard.write({ string: user?.id })
            }
          >
            {user?.id}
          </kbd>
        </p>
      </div>
      <div className={styles.buttons}>
        <Button
          type='button'
          onClick={async () => {
            const cache = queryCache.getQueryData([
              'participants',
              auth.id,
              auth.token
            ]) as ParticipantsResponse
            const participant = cache?.find((participant) =>
              participant.conversation.participants.includes(userID)
            )
            if (!cache || !participant) {
              const result = await createConversation(auth.token!, {
                recipient: userID
              })
              if (result.id) history.push(`/conversations/${result.id}`)
            } else {
              history.push(`/conversations/${participant.conversation.id}`)
            }
          }}
        >
          Message
        </Button>
        <Button
          type='button'
          disabled={user?.discriminator === 0}
          className={`${user?.disabled ? styles.disabled : ''}`}
          onClick={async () => {
            await toggleUser()
          }}
        >
          {user?.disabled ? 'Enable' : 'Disable'}
        </Button>
      </div>
    </div>
  )
}

const Lookup: FC = () => {
  const auth = Auth.useContainer()
  const [lookup, setLookup] = useState<string>()
  const history = useHistory()
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <div className={styles.lookup}>
      <div>
        <h1>User Lookup</h1>
        <p>Do I really need to explain this?</p>
        <div className={styles.search}>
          <Formik
            initialValues={{ tag: '' }}
            initialErrors={{ tag: 'No input' }}
            validate={validate}
            onSubmit={async (
              values,
              { setSubmitting, setErrors, setFieldError, resetForm }
            ) => {
              if (!values?.tag) return setFieldError('tag', 'Required')
              try {
                const [username, discriminator] = values.tag.split('#')
                const user = await findUser(
                  auth.token,
                  username,
                  discriminator === 'inn' ? '0' : discriminator
                )
                setLookup(user.id)
                resetForm()
                setErrors({ tag: 'No input' })
              } catch (e: any) {
                if (
                  e.response.data.errors.includes('UserNotFound') ||
                  e.response.data.errors.includes('RecipientNotFound')
                )
                  return setErrors({ tag: 'User not found' })
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {({ isSubmitting, isValid, errors }) => (
              <Form>
                <Field
                  placeholder={!isSubmitting ? 'Find User' : 'Finding...'}
                  component={Input}
                  name='tag'
                  autoComplete={'random'}
                  type='text'
                />
                {errors.tag === 'User not found' ? (
                  <Button type='button' className={styles.searchError} disabled>
                    <FontAwesomeIcon icon={faExclamationCircle} />
                  </Button>
                ) : !isValid ? (
                  <Button
                    type='button'
                    className={styles.searchPlaceholder}
                    disabled
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                ) : (
                  <Button
                    type='submit'
                    className={styles.search}
                    disabled={isSubmitting}
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <Suspense fallback={<></>}>
        {lookup && <UserLookup userID={lookup} />}
      </Suspense>
      {isMobile && (
        <Button
          className={styles.back}
          type='button'
          onClick={() => history.push('/admin')}
        >
          <FontAwesomeIcon className={styles.backButton} icon={faChevronLeft} />
        </Button>
      )}
    </div>
  )
}

export default Lookup
