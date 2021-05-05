import { FC } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { Auth } from '../authentication/state'
import { clientGateway, ModalTypes } from '../utils/constants'
import Button from '../components/Button'
import { BarLoader } from 'react-spinners'
import styles from './Security.module.scss'
import Input from '../components/Input'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHistory } from 'react-router-dom'
import * as Yup from 'yup'
import { Keychain } from '../keychain/state'
import { UI } from '../state/ui'
import { queryCache } from 'react-query'
import {
  createProtectedKeychain,
  exportProtectedKeychain,
  updateKeychainPassword
} from '@innatical/inncryption'

const PasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Too short, password must be at least 8 characters.')
    .max(140, 'Too long, password must be under 140 characters.'),
  oldPassword: Yup.string()
    .min(8, 'Too short, password must be at least 8 characters.')
    .max(140, 'Too long, password must be under 140 characters.')
})

const KeychainCard: FC = () => {
  const { hasKeychain } = Keychain.useContainer()
  const ui = UI.useContainer()
  return (
    <div className={styles.form}>
      <h4>Manage Keychain</h4>
      <Button
        type='button'
        className={
          hasKeychain ? styles.regenerateKeychain : styles.generateKeychain
        }
        onClick={() => ui.setModal({ name: ModalTypes.GENERATE_KEYCHAIN })}
      >
        {hasKeychain ? 'Regenerate Keychain' : 'Generate Keychain'}
      </Button>
    </div>
  )
}

const Security: FC = () => {
  const { token, id } = Auth.useContainer()
  const isMobile = useMedia('(max-width: 740px)')
  const history = useHistory()
  const {
    hasKeychain,
    decryptedKeychain,
    keychain: currentKeychain,
    decryptKeychain
  } = Keychain.useContainer()
  return (
    <div className={styles.security}>
      <h2>
        {isMobile && (
          <div
            className={styles.icon}
            onClick={() => isMobile && history.push('/settings')}
          >
            <FontAwesomeIcon
              className={styles.backButton}
              icon={faChevronLeft}
            />
          </div>
        )}
        Security
      </h2>
      <Formik
        initialValues={{ oldPassword: '', newPassword: '' }}
        validationSchema={PasswordSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            let keychain = currentKeychain
            let oldPassword = values.oldPassword

            if (hasKeychain) {
              if (!decryptedKeychain) {
                keychain = await decryptKeychain(values.oldPassword)
              }

              oldPassword = new TextDecoder('utf-8').decode(
                keychain?.authenticationToken
              )
            }

            let newPassword = values.newPassword

            if (keychain) {
              const newKeychain = await updateKeychainPassword(
                keychain,
                values.newPassword
              )
              await clientGateway.put(
                `/users/${id}/keychain`,
                {
                  keychain: exportProtectedKeychain(
                    await createProtectedKeychain(
                      newKeychain,
                      values.newPassword
                    )
                  )
                },
                {
                  headers: {
                    authorization: token
                  }
                }
              )

              newPassword = new TextDecoder('utf-8').decode(
                newKeychain?.authenticationToken
              )
            }

            await clientGateway.patch(
              `/users/${id}`,
              {
                oldPassword,
                newPassword
              },
              {
                headers: {
                  authorization: token
                }
              }
            )

            await queryCache.invalidateQueries(['keychain', id, token])
          } catch {
            setErrors({ oldPassword: 'Incorrect Password' })
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className={styles.form}>
            <h4>Change Password</h4>
            <div className={styles.password}>
              <label htmlFor='oldPassword' className={styles.inputName}>
                Current Password
              </label>
              <Field component={Input} name='oldPassword' type={'password'} />
              <ErrorMessage
                component='p'
                name='oldPassword'
                className={styles.error}
              />
            </div>
            <div className={styles.password}>
              <label htmlFor='newPassword' className={styles.inputName}>
                New Password
              </label>
              <Field component={Input} name='newPassword' type={'password'} />
              <ErrorMessage
                component='p'
                name='newPassword'
                className={styles.error}
              />
            </div>
            <Button
              disabled={isSubmitting}
              type='submit'
              className={styles.save}
            >
              {isSubmitting ? <BarLoader color='#ffffff' /> : 'Change Password'}
            </Button>
          </Form>
        )}
      </Formik>
      <KeychainCard />
    </div>
  )
}

export default Security
