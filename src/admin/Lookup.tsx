import React, { useState } from 'react'
import { queryCache, useMutation, useQuery } from 'react-query'
import { getUser, ParticipantsResponse } from '../user/remote'
import { Auth } from '../authentication/state'
import styles from './Lookup.module.scss'
import { Field, Form, Formik } from 'formik'
import { createConversation, findUser, validate } from '../conversation/remote'
import Input from '../components/Input'
import Button from '../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle, faSearch } from '@fortawesome/pro-solid-svg-icons'
import Icon from '../user/Icon'
import { useHistory } from 'react-router-dom'
import { clientGateway } from '../utils/constants'

const UserLookup = ({ userID }: { userID: string }) => {
  const history = useHistory()
  const auth = Auth.useContainer()
  const user = useQuery(['users', userID, auth.token], getUser)
  const [toggleUser] = useMutation(
    async () => (
      await clientGateway.patch(`/admin/users/${userID}`, {}, {
        headers: {
          Authorization: auth.token
        }
      })
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
        <Icon avatar={user.data?.avatar} state={user.data?.state} />
        <div className={styles.title}>
          <h4>{user.data?.username}#{user.data?.discriminator === 0
            ? 'inn'
            : user.data?.discriminator.toString().padStart(4, '0')}</h4>
          <p>{user.data?.status || 'No status set'}</p>
        </div>
      </div>
      <div className={styles.details}>
        <p><strong>Email:</strong> {user.data?.email}</p>
        <p><strong>ID:</strong> <kbd>{user.data?.id}</kbd></p>
      </div>
      <div className={styles.buttons}>
        <Button type='button' onClick={async () => {
          const cache = queryCache.getQueryData([
            'participants',
            auth.id,
            auth.token
          ]) as ParticipantsResponse
          const participant = cache?.find((participant) =>
            participant.conversation.participants.includes(
              userID
            )
          )
          if (!cache || !participant) {
            const result = await createConversation(auth.token!, {
              recipient: userID
            })
            if (result.id) history.push(`/conversations/${result.id}`)
          } else {
            history.push(
              `/conversations/${participant.conversation.id}`
            )
          }
        }}>
          Message
        </Button>
        {user.data?.discriminator !== 0 && <Button type='button' onClick={async () => {
          await toggleUser()
        }}>
          {user.data?.disabled ? 'Enable' : 'Disable'}
        </Button>}
      </div>
    </div>
  )
}

const Lookup = () => {
  const auth = Auth.useContainer()
  const [lookup, setLookup] = useState<string>()
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
              } catch (e) {
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
                  placeholder={
                    !isSubmitting ? 'Find User' : 'Finding...'
                  }
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
      {lookup && <UserLookup userID={lookup} />}
    </div>
  )
}

export default Lookup
