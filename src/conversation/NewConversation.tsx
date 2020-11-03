import React from 'react'
import styles from './NewConversation.module.scss'
import Input from '../components/Input'
import { Field, Form, Formik } from 'formik'
import { clientGateway } from '../constants'
import { Auth } from '../authentication/state'
import { isTag } from '../validations'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle, faSearch } from '@fortawesome/pro-solid-svg-icons'
import Button from '../components/Button'
import { queryCache } from 'react-query'
import { useHistory } from 'react-router-dom'

interface ConversationResponse {
  id: string
  channel_id: string
}

type FindResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

type formData = { tag: string }

type Participant = {
  id: string
  conversation: {
    id: string
    channel_id: string
    participants: string[]
  }
}

type ParticipantsResponse = Participant[]

const validate = (values: formData) => {
  const errors: { tag?: string } = {}
  console.log(values)
  if (!values.tag || !isTag(values.tag))
    errors.tag = 'A valid username is required'
  return errors
}

const createConversation = async (
  token: string,
  values: { recipient: string }
) =>
  (
    await clientGateway.post<ConversationResponse>(
      '/conversations',
      new URLSearchParams(values),
      { headers: { Authorization: token } }
    )
  ).data

const NewConversation = () => {
  const { token } = Auth.useContainer()
  const history = useHistory()
  return (
    <div className={styles.newConversation}>
      <Formik
        initialValues={{ tag: '' }}
        initialErrors={{ tag: 'No input' }}
        validate={validate}
        onSubmit={async (
          values,
          { setSubmitting, setErrors, setFieldError, resetForm }
        ) => {
          console.log('e')
          if (!values?.tag) return setFieldError('tag', 'Required')
          try {
            const splitted = values.tag.split('#')
            const user = (
              await clientGateway.get<FindResponse>('/users/find', {
                headers: { Authorization: token },
                params: {
                  username: splitted[0],
                  discriminator: splitted[1] === 'inn' ? '0' : splitted[1]
                }
              })
            ).data
            const cache = queryCache.getQueryData([
              'participants'
            ]) as ParticipantsResponse
            const participant = cache?.find((participant) =>
              participant.conversation.participants.includes(user.id)
            )
            if (!cache || !participant) {
              const result = await createConversation(token!, {
                recipient: user.id
              })
              if (result.id) history.push(`/conversations/${result.id}`)
              resetForm()
              setErrors({ tag: 'No input' })
            } else {
              history.push(`/conversations/${participant.conversation.id}`)
              resetForm()
              setErrors({ tag: 'No input' })
            }
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
                !isSubmitting ? 'Find or start a chat' : 'Finding...'
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
              <Button type='submit' className={styles.search}>
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            )}
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default NewConversation
