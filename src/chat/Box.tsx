import styles from './Box.module.scss'
import Button from '../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileUpload,
  faSmileWink,
  faTimes
} from '@fortawesome/pro-solid-svg-icons'
import React, { useEffect, useRef, useState } from 'react'
import { useInterval, useMedia } from 'react-use'
import Picker from 'emoji-picker-react'
import { Form, Formik, FastField, FieldInputProps } from 'formik'
import { postTyping, uploadFile } from './remote'
import { Auth } from '../authentication/state'
import { Chat } from './state'
import Upload from './Upload'

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
  channelID,
  typingIndicator
}: {
  channelID: string
  typingIndicator: boolean
}) => {
  const { sendMessage, uploadDetails, setUploadDetails } = Chat.useContainer()
  const { token } = Auth.useContainer()
  const isMobile = useMedia('(max-width: 940px)')
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
    if (!token) return
    const interval = setInterval(
      () => typing && postTyping(channelID, token),
      7000
    )
    return () => {
      clearInterval(interval)
    }
  }, [typing, channelID, token])

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
        onSubmit={async (values, { resetForm }) => {
          if (values?.message !== '') {
            if (uploadDetails) {
              setUploadDetails({
                status: 'uploading',
                file: uploadDetails.file
              })
              const url = await uploadFile(uploadDetails.file)
              setTyping(false)
              sendMessage(`${values.message}\n${url}`)
              setUploadDetails(null)
              resetForm()
            } else {
              setTyping(false)
              sendMessage(values.message)
              resetForm()
            }
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
                    inputMode={'text'}
                    autoComplete='off'
                    onChange={(event) => {
                      if (!token) return
                      if (event.target.value.length > 0 && !typing) {
                        postTyping(channelID, token)
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
            <Button
              type='button'
              onClick={() => {
                if (!!uploadDetails && emojiPicker) setEmojiPicker(false)
                else if (!!uploadDetails) {
                  if (uploadInput.current) uploadInput.current.value = ''
                  setUploadDetails(null)
                } else {
                  uploadInput.current?.click()
                }
              }}
            >
              <FontAwesomeIcon icon={uploadDetails ? faTimes : faFileUpload} />
              <input
                ref={uploadInput}
                className={styles.uploadInput}
                type='file'
                accept='.jpg, .png, .jpeg, .gif'
                onChange={async (event) => {
                  if (!token || !event.target.files?.item(0)) return
                  setUploadDetails({
                    status: 'pending',
                    file: event.target.files.item(0) as File
                  })
                }}
              />
              {uploadDetails && emojiPicker && (
                <div className={`${styles.badge}`} />
              )}
            </Button>
            {uploadDetails && !emojiPicker && (
              <Upload
                {...uploadDetails}
                onUpload={async (file) => {
                  setUploadDetails({
                    status: 'uploading',
                    file
                  })
                  const url = await uploadFile(file)
                  await sendMessage(url)
                  setUploadDetails(null)
                }}
              />
            )}
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

const Box = { View, Placeholder }

export default Box
