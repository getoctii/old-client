import React from 'react'
import styles from './AddFriend.module.scss'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Button from '../components/Button'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import { BarLoader } from 'react-spinners'
import { clientGateway } from '../utils/constants'
import { Auth } from '../authentication/state'
import { isTag } from '../utils/validations'
import { UI } from '../state/ui'

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

const validate = (values: formData) => {
  const errors: { tag?: string } = {}
  if (!isTag(values.tag)) errors.tag = 'A valid username is required'
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

const AddFriend = () => {
  const { token } = Auth.useContainer()
  const ui = UI.useContainer()
  return (
    <Modal onDismiss={() => ui.clearModal()}>
      <div className={styles.friend}>
        <h3>Add Friend</h3>
        <Formik
          initialValues={{ tag: '' }}
          validate={validate}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
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
              await createConversation(token!, { recipient: user.id })
              ui.clearModal()
            } catch (e) {
              if (
                e.response.data.errors.includes('UserNotFound') ||
                e.response.data.errors.includes('RecipientNotFound')
              )
                setErrors({ tag: 'User not found' })
              // TODO: Add message if you try to add yourself...
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <label htmlFor='tag' className={styles.inputName}>
                Username
              </label>
              <Field placeholder='username#1234' component={Input} name='tag' />
              <ErrorMessage component='p' name='tag' />
              <Button disabled={isSubmitting} type='submit'>
                {isSubmitting ? <BarLoader color='#ffffff' /> : 'Add Friend'}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  )
}

export default AddFriend
