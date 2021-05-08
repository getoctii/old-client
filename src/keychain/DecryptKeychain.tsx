import { FC } from 'react'
import Modal from '../components/Modal'
import { faKeySkeleton } from '@fortawesome/pro-solid-svg-icons'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import Input from '../components/Input'
import Button from '../components/Button'
import { BarLoader } from 'react-spinners'
import styles from './GenerateKeychain.module.scss'
import * as Yup from 'yup'
import { Keychain } from './state'
import { UI } from '../state/ui'

const PasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Too short, password must be at least 8 characters.')
    .max(140, 'Too long, password must be under 140 characters.')
})

const DecryptKeychain: FC = () => {
  const { decryptKeychain, setKeychainPassword } = Keychain.useContainer()
  const ui = UI.useContainer()
  return (
    <Formik
      initialValues={{ password: '' }}
      validationSchema={PasswordSchema}
      onSubmit={async (values, { setErrors }) => {
        try {
          await decryptKeychain(values.password)
          ui.setModal(undefined)
          setKeychainPassword(values.password)
        } catch (e) {
          return setErrors({
            password: 'Incorrect Password'
          })
        }
      }}
    >
      {({ isSubmitting, submitForm }) => (
        <Modal
          title={'Decrypt Keychain'}
          icon={faKeySkeleton}
          onDismiss={() => {}}
          bottom={
            <Button
              disabled={isSubmitting}
              type='button'
              onClick={submitForm}
              className={styles.submit}
            >
              {isSubmitting ? <BarLoader color='#ffffff' /> : 'Decrypt'}
            </Button>
          }
        >
          <Form className={styles.form}>
            <div className={styles.password}>
              <label htmlFor='password' className={styles.inputName}>
                Password
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

export default DecryptKeychain
