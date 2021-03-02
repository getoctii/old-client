import { faExclamationCircle, faSearch } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Field, Form, Formik } from 'formik'
import React, { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Input from '../components/Input'
import { createConversation, findUser, validate } from '../conversation/remote'
import { UI } from '../state/ui'
import { clientGateway } from '../utils/constants'
import styles from './AddParticipant.module.scss'
import { useQuery } from 'react-query'
import { getRelationships, RelationshipTypes } from '../friends/remote'

const AddParticipant = ({
  groupID,
  isPrivate,
  participant
}: {
  groupID?: string
  isPrivate: boolean
  participant?: string
}) => {
  const uiStore = UI.useContainer()
  const history = useHistory()
  const { token, id } = Auth.useContainer()
  const { data: relationships } = useQuery(
    ['relationships', id, token],
    getRelationships
  )
  const friends = useMemo(
    () =>
      relationships?.filter(
        (relationship) => relationship.type === RelationshipTypes.FRIEND
      ) ?? [],
    [relationships]
  )

  return friends.length > 0 ? (
    <div className={styles.addParticipant}>
      <h3>Add Friends</h3>
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
            const splitted = values.tag.split('#')
            const searchedUser = await findUser(
              token,
              splitted[0],
              splitted[1] === 'inn' ? '0' : splitted[1]
            )
            if (isPrivate) {
              const result = await createConversation(token!, {
                recipient: participant!
              })
              if (result.id) {
                history.push(`/conversations/${result.id}`)
                await clientGateway.post(
                  `/conversations/${result.id}`,
                  {
                    recipient: searchedUser.id
                  },
                  { headers: { Authorization: token } }
                )
              }
              resetForm()
              setErrors({ tag: 'No input' })
            } else if (groupID) {
              await clientGateway.post(
                `/conversations/${groupID}`,
                {
                  recipient: searchedUser.id
                },
                { headers: { Authorization: token } }
              )
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
            uiStore.clearModal()
          }
        }}
      >
        {({ isSubmitting, isValid, errors }) => (
          <Form>
            <Field
              placeholder={
                !isSubmitting
                  ? isPrivate
                    ? 'Start a new group chat'
                    : 'Add a user'
                  : 'Finding...'
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
  ) : (
    <div className={styles.noFriends}>
      <h2>You have no friends!</h2>
      <Button type={'button'} onClick={() => history.push('/friends')}>
        Go add some!
      </Button>
    </div>
  )
}

export default AddParticipant
