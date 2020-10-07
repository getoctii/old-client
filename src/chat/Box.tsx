import styles from './Chat.module.scss'
import Button from '../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileUpload, faSmileWink } from '@fortawesome/pro-solid-svg-icons'
import React, { useRef, useState, useEffect } from 'react'
import { useInterval, useMedia } from 'react-use'
// @ts-ignore
import emoji from 'emoji-dictionary'
import Picker from 'emoji-picker-react'

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
  postTyping: (msg: string) => void
}) => {
  const isMobile = useMedia('(max-width: 800px)')
  const [adjective, setAdjectives] = useState(
    adjectives[Math.floor(Math.random() * adjectives.length)]
  )
  useInterval(() => {
    setAdjectives(adjectives[Math.floor(Math.random() * adjectives.length)])
  }, 30000)
  const uploadInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [emojiPicker, setEmojiPicker] = useState(false)
  useInterval(() => postTyping(message), 7000)
  useEffect(() => {
    if (message.length > 0) postTyping(message)
  }, [message, postTyping])
  return (
    <div className={styles.box}>
      <form
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
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type='text'
          placeholder={`Say something${adjective}...`}
          {...(!isMobile && { autoFocus: true })}
        />
      </form>
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
