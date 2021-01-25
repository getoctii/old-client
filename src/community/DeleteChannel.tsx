import { faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ErrorMessage, Field, Formik, Form } from 'formik'
import React from 'react'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import { clientGateway } from '../utils/constants'
import { BarLoader } from 'react-spinners'
import styles from './NewChannel.module.scss'
import { CommunityResponse } from './remote'

type formData = { name: string }

const validate = (values: formData) => {
  const errors: { name?: string } = {}
  if (
    !values ||
    !(
      values.name.length <= 30 &&
      values.name.length >= 2 &&
      /^[a-zA-Z0-9_-]+$/.test(values.name)
    )
  )
    errors.name = 'Invalid Name'
  return errors
}

export const NewChannel = ({
  community,
  onDismiss
}: {
  community?: CommunityResponse
  onDismiss: () => void
}) => {
  const { token } = Auth.useContainer()
  return (
    <Modal onDismiss={onDismiss}>
      <Formik
        initialValues={{ name: '' }}
        validate={validate}
        onSubmit={async (
          values,
          { setSubmitting, setFieldError, setErrors }
        ) => {
          try {
            if (!values.name) return setFieldError('name', 'Required')
            await clientGateway.post(
              `/communities/${community?.id}/channels`,
              { name: values.name.split(' ').join('-') },
              {
                headers: { Authorization: token }
              }
            )
            onDismiss()
          } catch (e) {
            const errors = e.response.data.errors
            const userErrors: { name?: string } = {}
            if (errors.includes('ChannelNameInvalid'))
              userErrors.name = 'Invalid Channel Name'
            setErrors(userErrors)
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className={styles.newChannel}>
              <h5>{community?.name}</h5>
              <h4>
                Create
                <span style={{ float: 'right' }}>
                  <FontAwesomeIcon
                    onClick={() => onDismiss()}
                    icon={faTimesCircle}
                  />
                </span>
              </h4>
              <h3>
                <span role='img' aria-label='thinking'>
                  🤔
                </span>{' '}
                What would you like to call this channel?
              </h3>

              <label htmlFor='name' className={styles.label}>
                Name
              </label>
              <Field
                component={Input}
                id='name'
                name='name'
                type='name'
                enterkeyhint='next'
              />
              <ErrorMessage
                component='p'
                className={styles.error}
                name='name'
              />
              <ul>
                <li>Only contain letters, numbers, dashes, and underscores</li>
                <li>Between 2-30 characters long</li>
              </ul>
              <Button disabled={isSubmitting} type='submit'>
                {isSubmitting ? <BarLoader color='#ffffff' /> : 'New Channel'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}
