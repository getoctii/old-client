import { ErrorMessage, Field, Form, Formik } from 'formik'
import { Auth } from '../../../../authentication/state'
import Button from '../../../../components/Button'
import Input from '../../../../components/Input'
import { clientGateway } from '../../../../utils/constants'
import { BarLoader } from 'react-spinners'
import styles from './NewVersion.module.scss'
import { useRouteMatch } from 'react-router-dom'
import { getProduct } from '../../../remote'
import { UI } from '../../../../state/ui'
import { queryCache, useQuery } from 'react-query'
import { faTimes } from '@fortawesome/pro-solid-svg-icons'
import * as Yup from 'yup'
import Modal from '../../../../components/Modal'
import React from 'react'
import TextArea from '../../../../components/TextArea'

const VersionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(30, 'Too long, must be less then 30 characters.'),
  description: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(140, 'Too long, must be less then 140 characters.')
})

const NewVersion = () => {
  const { token } = Auth.useContainer()
  const ui = UI.useContainer()
  const match = useRouteMatch<{ productID: string }>(
    '/communities/:id/products/:productID'
  )
  const { data: product } = useQuery(
    ['product', match?.params?.productID, token],
    getProduct
  )
  return (
    <Formik
      initialValues={{ name: '', description: '' }}
      validationSchema={VersionSchema}
      onSubmit={async (values, { setSubmitting, setFieldError, setErrors }) => {
        try {
          if (!values.name) return setFieldError('name', 'Required')
          const { data: version } = await clientGateway.post<{
            number: number
          }>(
            `/products/${match?.params?.productID}/versions`,
            {
              name: values.name,
              description: values.description
            },
            {
              headers: { Authorization: token }
            }
          )
          if (!version) return
          queryCache.setQueryData<number[]>(
            ['versions', match?.params?.productID, token],
            (initial) => {
              if (initial) return [...initial, version.number]
              else return [version.number]
            }
          )
          ui.clearModal()
        } catch (e) {
          const errors = e.response.data.errors
          const userErrors: { name?: string } = {}
          if (errors.includes('VersionNameInvalid'))
            userErrors.name = 'Invalid Version Name'
          setErrors(userErrors)
          ui.clearModal()
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <div className={styles.newVersion}>
            <Modal
              onDismiss={() => ui.clearModal()}
              title={'New Version'}
              subtitle={`${product?.name}`}
              icon={faTimes}
              bottom={
                <Button
                  disabled={isSubmitting}
                  type='submit'
                  className={styles.createButton}
                >
                  {isSubmitting ? (
                    <BarLoader color='#ffffff' />
                  ) : (
                    'New Resource'
                  )}
                </Button>
              }
            >
              <label htmlFor='name' className={styles.inputName}>
                Name
              </label>
              <Field
                component={Input}
                id='name'
                name='name'
                type='name'
                enterKeyHint='next'
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
              <label htmlFor='description' className={styles.inputName}>
                Change Log
              </label>
              <TextArea name={'description'} />
              <ErrorMessage
                component='p'
                className={styles.error}
                name='description'
              />
            </Modal>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default NewVersion
