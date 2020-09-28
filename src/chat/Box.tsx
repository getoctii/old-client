import styles from './Chat.module.scss'
import Button from '../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileUpload } from '@fortawesome/pro-solid-svg-icons'
import React, { useRef, useState } from 'react'
import { useInterval, useMedia } from 'react-use'

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

export default ({sendMessage, uploadFile}: {sendMessage: (msg: string) => void, uploadFile: (file: File) => void}) => {
  const isMobile = useMedia('(max-width: 800px)')
  const [adjective, setAdjectives] = useState(
    adjectives[Math.floor(Math.random() * adjectives.length)]
  )
  useInterval(() => {
    setAdjectives(adjectives[Math.floor(Math.random() * adjectives.length)])
  }, 30000)
  const uploadInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  return (
    <div className={styles.box}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (message !== '') {
            sendMessage(message)
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
    </div>
  )
}