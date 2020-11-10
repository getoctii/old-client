import styles from './Box.module.scss'
import Button from '../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileUpload, faSmileWink } from '@fortawesome/pro-solid-svg-icons'
import React, { useEffect, useRef, useState } from 'react'
import { useInterval, useMedia } from 'react-use'
import Picker from 'emoji-picker-react'
import { Form, Formik, FastField, FieldInputProps } from 'formik'

const adjectives = [
  ' amazing',
  ' insightful',
  ' funny',
  ' about cats',
  ' interesting',
  ' special',
  ' innovative',
  ', anything really',
  ' delightful',
  ' steamy',
  ' about Innatical'
]

const View = ({
  sendMessage,
  uploadFile,
  postTyping,
  typingIndicator
}: {
  sendMessage: (msg: string) => void
  uploadFile: (file: File) => void
  postTyping: () => void
  typingIndicator: boolean
}) => {
  const isMobile = useMedia('(max-width: 800px)')
  const [typing, setTyping] = useState<boolean>(false)
  const [adjective, setAdjectives] = useState(
    adjectives[Math.floor(Math.random() * adjectives.length)]
  )
  useInterval(() => {
    setAdjectives(adjectives[Math.floor(Math.random() * adjectives.length)])
  }, 30000)
  const uploadInput = useRef<HTMLInputElement>(null)
  const [emojiPicker, setEmojiPicker] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => typing && postTyping(), 7000)
    return () => {
      clearInterval(interval)
    }
  }, [typing, postTyping])

  return (
    <div
      className={`${styles.box} ${
        typingIndicator ? styles.typingIndicator : ''
      }`}
    >
      <Formik
        initialValues={{ message: '' }}
        validate={(values) => {
          if (values?.message !== '') return {}
          return { message: 'No message content' }
        }}
        onSubmit={(values, { resetForm }) => {
          if (values?.message !== '') {
            setTyping(false)
            sendMessage(values.message)
            resetForm()
          }
        }}
      >
        {({ setFieldValue, values }) => (
          <>
            <Form>
              <FastField
                name='message'
                placeholder={`Say something${adjective}...`}
              >
                {({ field }: { field: FieldInputProps<any> }) => (
                  <input
                    {...field}
                    placeholder={`Say something${adjective}...`}
                    type='text'
                    autoComplete='off'
                    onChange={(event) => {
                      if (event.target.value.length > 0 && !typing) {
                        postTyping()
                        setTyping(true)
                      } else if (event.target.value.length === 0 && typing) {
                        setTyping(false)
                      }
                      field.onChange(event)
                    }}
                    {...(!isMobile && { autoFocus: true })}
                  />
                )}
              </FastField>
            </Form>
            <Button type='button' onClick={() => uploadInput.current?.click()}>
              <FontAwesomeIcon icon={faFileUpload} />
              <input
                ref={uploadInput}
                className={styles.uploadInput}
                type='file'
                accept='.jpg, .png, .jpeg, .gif'
                onChange={async (event) => {
                  await uploadFile(event.target.files?.item(0) as any)
                }}
              />
            </Button>
            {emojiPicker && (
              <Picker
                onEmojiClick={(_, data) =>
                  setFieldValue(
                    'message',
                    values.message
                      ? `${values.message} ${data.emoji}`
                      : data.emoji
                  )
                }
                native
              />
            )}
            {!isMobile && (
              <Button
                type='button'
                onClick={() => setEmojiPicker(!emojiPicker)}
              >
                <FontAwesomeIcon icon={faSmileWink} />
              </Button>
            )}
          </>
        )}
      </Formik>
    </div>
  )
}

const Placeholder = () => {
  return (
    <div className={styles.placeholder}>
      <div className={styles.input} />
      <div className={styles.upload} />
      <div className={styles.emoji} />
    </div>
  )
}

export default { View, Placeholder }
