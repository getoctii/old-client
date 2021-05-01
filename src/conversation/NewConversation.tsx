import { FC } from 'react'
import styles from './NewConversation.module.scss'
import Input from '../components/Input'
import { Field, Form, Formik } from 'formik'
import { Auth } from '../authentication/state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle, faSearch } from '@fortawesome/pro-solid-svg-icons'
import Button from '../components/Button'
import { queryCache } from 'react-query'
import { useHistory } from 'react-router-dom'
import { ParticipantsResponse } from '../user/remote'
import { createConversation, findUser, validate } from './remote'

const NewConversation: FC = () => {
  const { id, token } = Auth.useContainer()
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
          if (!values?.tag) return setFieldError('tag', 'Required')
          try {
            const [username, discriminator] = values.tag.split('#')
            const user = await findUser(
              token,
              username,
              discriminator === 'inn' ? '0' : discriminator
            )
            const cache = queryCache.getQueryData([
              'participants',
              id,
              token
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
  )
}

export default NewConversation
