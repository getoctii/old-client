import styles from './Chat.module.scss'
import Button from '../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileUpload, faSmileWink } from '@fortawesome/pro-solid-svg-icons'
import React, { useRef, useState, useEffect } from 'react'
import { useInterval, useMedia } from 'react-use'
// @ts-ignore
import Picker from 'emoji-picker-react'
import { Form, Formik, FastField } from 'formik'

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

export default ({
  sendMessage,
  uploadFile,
  postTyping
}: {
  sendMessage: (msg: string) => void
  uploadFile: (file: File) => void
  postTyping: () => void
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
  const [message, setMessage] = useState('')
  const [emojiPicker, setEmojiPicker] = useState(false)
  useInterval(() => typing && postTyping(), 7000)
  useEffect(() => {
    if (message.length > 0 && !typing) {
      postTyping()
      setTyping(true)
    } else if (message.length === 0 && typing) {
      setTyping(false)
    }
  }, [message, postTyping, typing])
  return (
    <div className={styles.box}>
      <Formik
        initialValues={{ message: '' }}
        validate={(values) => {
          if (values?.message !== '') return {}
          return { message: 'No message content' }
        }}
        onSubmit={(values, { resetForm }) => {
          if (values?.message !== '') {
            sendMessage(values.message)
            resetForm()
          }
        }}
      >
        {() => (
          <Form>
            <FastField
              name='message'
              placeholder={`Say something${adjective}...`}
            >
              {({ field }: any) => (
                <input
                  {...field}
                  placeholder={`Say something${adjective}...`}
                  type='text'
                  {...(!isMobile && { autoFocus: true })}
                />
              )}
            </FastField>
          </Form>
        )}
      </Formik>
      {/* <form
        onSubmit={(event) => {
          event.preventDefault()
          if (message !== '') {
            sendMessage(
              message.replace(
                /:\w+:/gi,
                (name: string) => emoji.getUnicode(name) ?? name
              )
            )
            setMessage('')
          }
        }}
      > */}
      {/* </form> */}
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
          onEmojiClick={(event, data) =>
            setMessage(message ? `${message} ${data.emoji}` : data.emoji)
          }
          native
        />
      )}
      {!isMobile && (
        <Button type='button' onClick={() => setEmojiPicker(!emojiPicker)}>
          <FontAwesomeIcon icon={faSmileWink} />
        </Button>
      )}
    </div>
  )
}
