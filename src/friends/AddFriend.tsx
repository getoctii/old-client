import React from 'react'
import styles from './AddFriend.module.scss'
import Input from '../components/Input'
import Button from '../components/Button'
import { Field, Form, Formik } from 'formik'
import { clientGateway } from '../utils/constants'
import { Auth } from '../authentication/state'
import { isTag } from '../utils/validations'
import { findUser } from '../conversation/remote'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle, faSearch } from '@fortawesome/pro-solid-svg-icons'

type formData = { tag: string }

const validate = (values: formData) => {
  const errors: { tag?: string } = {}
  if (!values.tag) errors.tag = 'No input'
  if (!isTag(values.tag)) errors.tag = 'A valid tag is required'
  return errors
}

const AddFriend = () => {
  const { token, id } = Auth.useContainer()
  return (
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
            setFieldError('tag', 'No input')
            resetForm()
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
              placeholder={!isSubmitting ? 'Add a new friend' : 'Finding...'}
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

export default AddFriend
