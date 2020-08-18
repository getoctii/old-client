import React from 'react'
import styles from './NewConversation.module.scss'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import { BarLoader } from 'react-spinners'
import { useMutation } from 'react-query'
import { clientGateway } from '../../constants'
import { Auth } from '../../authentication/state'
import { isTag } from './validations'

interface ConversationResponse {
  id: string,
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

const NewConversation = ({ onDismiss }: { onDismiss?: any }) => {
  const { token } = Auth.useContainer()
  const [createConversation] = useMutation(async (values: { recipient: string }) => (await clientGateway.post<ConversationResponse>('/conversations', new URLSearchParams(values), { headers: { Authorization: token } })).data)
  return (
    <Modal onDismiss={onDismiss}>
      <div className={styles.invite}>
        <h3>Start a Conversation</h3>
        <Formik initialValues={{ tag: '' }} validate={validate}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                  try {
                    const splitted = values.tag.split('#')
                    const user = (await clientGateway.get<FindResponse>('/users/find', {
                      headers: { Authorization: token },
                      params: { username: splitted[0], discriminator: splitted[1] }
                    })).data
                    console.log(await createConversation({ recipient: user.id }))
                  } catch (e) {
                    console.warn('UWU', e)
                    if (e.response.data.errors.includes('UserNotFound') || e.response.data.errors.includes('RecipientNotFound')) setErrors({ tag: 'User not found' })
                    console.log(e.response.data.errors.includes('InvalidRecipient'))
                  } finally {
                    setSubmitting(false)
                  }
                }}>
          {({ isSubmitting }) => (
            <Form>
              <label htmlFor='tag' className={styles.inputName}>Username</label>
              <Field placeholder='username#1234' component={Input} name='tag'/>
              <ErrorMessage component='p' name='tag'/>
              <Button disabled={isSubmitting} type='submit'>{isSubmitting ? <BarLoader
                color="#ffffff"/> : 'Start Chatting'}</Button>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  )
}

export default NewConversation
