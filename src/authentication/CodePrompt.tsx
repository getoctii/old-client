import { faLock } from '@fortawesome/pro-solid-svg-icons'
import { ErrorMessage, Form, Formik, Field } from 'formik'
import { FC } from 'react'
import Input from '../components/Input'
import Modal from '../components/Modal'
import * as Yup from 'yup'
import Button from '../components/Button'
import styles from './CodePrompt.module.scss'
import { UI } from '../state/ui'

const CodeSchema = Yup.object().shape({
  code: Yup.string()
    .matches(/^\d+$/, 'Must be digits')
    .length(6, 'Must be 6 characters')
})

const CodePrompt: FC<{ onCode: (code: string) => void }> = ({ onCode }) => {
  const ui = UI.useContainer()
  return (
    <Formik
      initialValues={{ code: '' }}
      validationSchema={CodeSchema}
      onSubmit={(values) => {
        ui.setModal(undefined)
        onCode(values.code)
      }}
    >
      {({ submitForm }) => (
        <Modal
          title={'2FA Code Required'}
          icon={faLock}
          onDismiss={() => {}}
          bottom={
            <Button
              type='button'
              onClick={submitForm}
              className={styles.submit}
            >
              Submit Code
            </Button>
          }
        >
          <Form className={styles.form}>
            <div className={styles.code}>
              <label htmlFor='code'>Code</label>
              <Field component={Input} name='code' autoFocus />
              <ErrorMessage
                component='p'
                name='code'
                className={styles.error}
              />
            </div>
          </Form>
        </Modal>
      )}
    </Formik>
  )
}

export default CodePrompt
