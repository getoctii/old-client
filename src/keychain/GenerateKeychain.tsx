import { FC } from 'react'
import Modal from '../components/Modal'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import Input from '../components/Input'
import Button from '../components/Button'
import { BarLoader } from 'react-spinners'
import styles from './GenerateKeychain.module.scss'
import * as Yup from 'yup'
import {
  createProtectedKeychain,
  exportProtectedKeychain,
  generateKeychain
} from '@innatical/inncryption'
import { clientGateway } from '../utils/constants'
import { Auth } from '../authentication/state'
import { Keychain } from './state'
import { UI } from '../state/ui'
import { queryCache } from 'react-query'

const PasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Too short, password must be at least 8 characters.')
    .max(140, 'Too long, password must be under 140 characters.')
})

const GenerateKeychain: FC = () => {
  const { id, token } = Auth.useContainer()
  const {
    hasKeychain,
    decryptedKeychain,
    keychain: currentKeychain,
    decryptKeychain
  } = Keychain.useContainer()
  const ui = UI.useContainer()
  return (
    <Formik
      initialValues={{ password: '' }}
      validationSchema={PasswordSchema}
      onSubmit={async (values, { setErrors }) => {
        const keychain = await generateKeychain(values.password)
        const protectedKeychain = exportProtectedKeychain(
          await createProtectedKeychain(keychain, values.password)
        )
        const newPassword = keychain.authenticationToken

        try {
          if (hasKeychain) {
            let oldKeychain = currentKeychain
            if (!decryptedKeychain) {
              oldKeychain = await decryptKeychain(values.password)
            }

            await clientGateway.patch(
              `/users/${id}`,
              {
                oldPassword: oldKeychain?.authenticationToken,
                newPassword: newPassword
              },
              {
                headers: {
                  authorization: token
                }
              }
            )
          } else {
            await clientGateway.patch(
              `/users/${id}`,
              {
                oldPassword: values.password,
                newPassword: newPassword
              },
              {
                headers: {
                  authorization: token
                }
              }
            )
          }
        } catch (e) {
          console.error(e)
          return setErrors({
            password: 'Incorrect Password'
          })
        }

        await clientGateway.put(
          `/users/${id}/keychain`,
          {
            keychain: protectedKeychain
          },
          {
            headers: {
              authorization: token
            }
          }
        )

        await queryCache.invalidateQueries(['keychain', id, token])
        ui.setModal(undefined)
      }}
    >
      {({ isSubmitting, submitForm }) => (
        <Modal
          title={'New Keychain'}
          icon={faKey}
          onDismiss={() => {}}
          bottom={
            <Button
              disabled={isSubmitting}
              type='button'
              onClick={submitForm}
              className={styles.submit}
            >
              {isSubmitting ? <BarLoader color='#ffffff' /> : 'Create Keychain'}
            </Button>
          }
        >
          <Form className={styles.form}>
            <div className={styles.password}>
              <label htmlFor='password' className={styles.inputName}>
                Current Password
              </label>
              <Field component={Input} name='password' type={'password'} />
              <ErrorMessage
                component='p'
                name='password'
                className={styles.error}
              />
            </div>
          </Form>
        </Modal>
      )}
    </Formik>
  )
}

export default GenerateKeychain
