import { faBedAlt } from '@fortawesome/pro-duotone-svg-icons'
import { faExclamationCircle, faSearch } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Field, Form, Formik } from 'formik'
import React from 'react'
import { queryCache } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Input from '../components/Input'
import { findUser } from '../conversation/remote'
import { clientGateway } from '../utils/constants'
import { isTag } from '../utils/validations'
import styles from './EmptyFriends.module.scss'
import { RelationshipResponse, RelationshipTypes } from './remote'

type formData = { tag: string }

const validate = (values: formData) => {
  const errors: { tag?: string } = {}
  if (!isTag(values.tag)) errors.tag = 'A valid tag is required'
  return errors
}

const EmptyFriends = () => {
  const history = useHistory()
  const { id, token } = Auth.useContainer()
  return (
    <div className={styles.emptyFriends}>
      <div className={styles.container}>
        <FontAwesomeIcon icon={faBedAlt} size='4x' />
        <h1>Looks like you got no friends!</h1>
        <p>Use the search bar to add a new friend!</p>
        <div className={styles.addFriend}>
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
                if (!id || !token) return
                const [username, discriminator] = values.tag.split('#')
                const user = await findUser(
                  token,
                  username,
                  discriminator === 'inn' ? '0' : discriminator
                )
                await clientGateway.post(
                  `/relationships/${user.id}`,
                  {},
                  {
                    headers: { Authorization: token }
                  }
                )

                queryCache.setQueryData<RelationshipResponse[]>(
                  ['relationships', id, token],
                  (initial) => {
                    if (initial) {
                      return [
                        ...initial,
                        {
                          user_id: id,
                          recipient_id: user.id,
                          type: RelationshipTypes.OUTGOING_FRIEND_REQUEST
                        }
                      ]
                    } else {
                      return [
                        {
                          user_id: id,
                          recipient_id: user.id,
                          type: RelationshipTypes.OUTGOING_FRIEND_REQUEST
                        }
                      ]
                    }
                  }
                )
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
                    !isSubmitting ? 'Add a new friend' : 'Finding...'
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
    </div>
  )
}

export default EmptyFriends
