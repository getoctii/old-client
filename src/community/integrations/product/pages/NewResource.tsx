import { ErrorMessage, Field, Form, Formik } from 'formik'
import { Auth } from '../../../../authentication/state'
import Button from '../../../../components/Button'
import Input from '../../../../components/Input'
import { clientGateway } from '../../../../utils/constants'
import { BarLoader } from 'react-spinners'
import styles from './NewResource.module.scss'
import { useRouteMatch } from 'react-router-dom'
import { getProduct, ResourceTypes } from '../../../remote'
import { UI } from '../../../../state/ui'
import { queryCache, useQuery } from 'react-query'
import { faTimes } from '@fortawesome/pro-solid-svg-icons'
import * as Yup from 'yup'
import Modal from '../../../../components/Modal'
import { FC } from 'react'

const ResourceSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(30, 'Too long, must be less then 30 characters.'),
  type: Yup.number()
})

const NewResource: FC = () => {
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
      initialValues={{ name: '', type: ResourceTypes.THEME }}
      validationSchema={ResourceSchema}
      onSubmit={async (values, { setSubmitting, setFieldError, setErrors }) => {
        try {
          if (!values.name) return setFieldError('name', 'Required')
          const { data: resource } = await clientGateway.post<{ id: string }>(
            `/products/${match?.params?.productID}/resources`,
            {
              name: values.name,
              type: values.type
            },
            {
              headers: { Authorization: token }
            }
          )
          if (!resource) return
          queryCache.setQueryData<string[]>(
            ['resources', match?.params?.productID, token],
            (initial) => {
              if (initial) return [...initial, resource.id]
              else return [resource.id]
            }
          )
          ui.clearModal()
        } catch (e) {
          const errors = e.response.data.errors
          const userErrors: { name?: string } = {}
          if (errors.includes('ResourceNameInvalid'))
            userErrors.name = 'Invalid Resource Name'
          setErrors(userErrors)
          ui.clearModal()
        } finally {
          setSubmitting(false)
        }
      }}
    >
      {({ isSubmitting, setFieldValue, values }) => (
        <Form>
          <div className={styles.newResource}>
            <Modal
              onDismiss={() => ui.clearModal()}
              title={'New Resource'}
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
              <label htmlFor='type' className={styles.inputName}>
                Type
              </label>
              <div className={styles.type}>
                <Button
                  type={'button'}
                  className={`${
                    values.type === ResourceTypes.THEME ? styles.selected : ''
                  }`}
                  onClick={() => setFieldValue('type', ResourceTypes.THEME)}
                >
                  Theme
                </Button>
                <Button
                  type={'button'}
                  className={`${
                    values.type === ResourceTypes.SERVER_INTEGRATION
                      ? styles.selected
                      : ''
                  }`}
                  onClick={() =>
                    setFieldValue('type', ResourceTypes.SERVER_INTEGRATION)
                  }
                >
                  Server Integration
                </Button>
              </div>
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
            </Modal>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default NewResource
