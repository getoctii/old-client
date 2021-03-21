import styles from './Box.module.scss'
import Button from '../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileUpload,
  faSmileWink,
  faTimes
} from '@fortawesome/pro-solid-svg-icons'
import React, { Suspense, useMemo, useRef, useState } from 'react'
import { useMedia } from 'react-use'
import Picker from 'emoji-picker-react'
import { Auth } from '../authentication/state'
import { postTyping, uploadFile } from './remote'
import { Chat } from './state'
import Upload from './Upload'
import { emptyEditor, withMentions } from '../utils/slate'
import Editor from '../components/Editor'
import { createEditor, Editor as SlateEditor, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import { withReact } from 'slate-react'

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

const BoxView = ({
  channelID,
  hasPermission
}: {
  channelID: string
  hasPermission: boolean
}) => {
  const { sendMessage, uploadDetails, setUploadDetails } = Chat.useContainer()
  const { token } = Auth.useContainer()
  const isMobile = useMedia('(max-width: 740px)')
  const adjective = useMemo(
    () => adjectives[Math.floor(Math.random() * adjectives.length)],
    []
  )
  const uploadInput = useRef<HTMLInputElement>(null)
  const [emojiPicker, setEmojiPicker] = useState(false)
  const editor = useMemo(
    () => withHistory(withReact(withMentions(createEditor()))),
    []
  )
  return (
    <div>
      <Suspense fallback={<BoxPlaceholder />}>
        {uploadDetails && !emojiPicker && (
          <div className={styles.uploadPicker}>
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
          </div>
        )}

        {emojiPicker && (
          <div className={styles.emojiPicker}>
            <Picker
              onEmojiClick={(_, data) => {
                if (editor.selection) {
                  editor.insertText(data.emoji)
                } else {
                  Transforms.insertText(editor, data.emoji, {
                    at: SlateEditor.end(editor, [])
                  })
                }
              }}
              native
            />
          </div>
        )}

        {hasPermission ? (
          <Editor
            id={'sendMessage'}
            editor={editor}
            emptyEditor={emptyEditor}
            newLines
            className={styles.box}
            mentionsClassName={styles.mentionsWrapper}
            inputClassName={styles.input}
            typingClassName={styles.typingIndicator}
            placeholder={`Say something ${adjective}...`}
            userMentions
            onTyping={async () => {
              if (!token) return
              await postTyping(channelID, token)
            }}
            onEnter={async (content) => {
              if (content !== '' || uploadDetails) {
                if (uploadDetails) {
                  setUploadDetails({
                    status: 'uploading',
                    file: uploadDetails.file
                  })
                  const url = await uploadFile(uploadDetails.file)
                  if (content !== '') {
                    await sendMessage(`${content}\n${url}`)
                  } else {
                    await sendMessage(url)
                  }
                  setUploadDetails(null)
                } else {
                  await sendMessage(content)
                }
              }
            }}
          >
            <div className={styles.buttons}>
              {!isMobile && (
                <Button
                  type='button'
                  onClick={() => setEmojiPicker(!emojiPicker)}
                >
                  <FontAwesomeIcon icon={faSmileWink} />
                </Button>
              )}

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
                <FontAwesomeIcon
                  icon={uploadDetails && !emojiPicker ? faTimes : faFileUpload}
                />
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
            </div>
          </Editor>
        ) : (
          <div className={styles.boxNoSend}>
            Sending Messages is disabled for this channel!
          </div>
        )}
      </Suspense>
    </div>
  )
}

BoxView.whyDidYouRender = true

const BoxPlaceholder = () => {
  return (
    <div className={styles.placeholder}>
      <div className={styles.input} />
      <div className={styles.upload} />
      <div className={styles.emoji} />
    </div>
  )
}

const Box = { View: BoxView, Placeholder: BoxPlaceholder }

export default Box
