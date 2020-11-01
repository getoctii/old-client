import React, { useEffect, memo, ReactChildren, useState } from 'react'
import styles from './Message.module.scss'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import { useAudio, useMeasure } from 'react-use'
import { faCopy, faPause, faPlay, faTrashAlt } from '@fortawesome/pro-solid-svg-icons'
import { Clipboard } from '@capacitor/core'
import { Auth } from '../authentication/state'
import { Confirmation } from '../components/Confirmation'
import { useMutation, useQuery } from 'react-query'
import { clientGateway } from '../constants'
import { AnimatePresence } from 'framer-motion'
import { UserResponse } from '../user/remote'
import Context from '../components/Context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const secondsToTimestamp = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${Math.floor(seconds - minutes * 60).toString().padStart(2, '0')}`
}

const AudioEmbed = ({
  src
}: {
  src: string
}) => {
  const [audio, state, controls] = useAudio({
    src
  })

  return (
    <div className={styles.audioEmbed}>
      {audio}
      <FontAwesomeIcon className={styles.icon} onClick={() => state.paused ? controls.play() : controls.pause()} icon={state.paused ? faPlay : faPause}/>
      <input value={state.time} max={state.duration} onChange={e => controls.seek(e.target.valueAsNumber)} step='any' type='range' />
      <span>{secondsToTimestamp(state.time)}/{secondsToTimestamp(state.duration)}</span>
    </div>
  )
}

const ImageEmbed = ({
  children,
  onResize
}: {
  children: ReactChildren
  onResize: () => void
}) => {
  const [ref, size] = useMeasure<HTMLDivElement>()
  useEffect(() => {
    onResize()
  }, [size, onResize])
  return <div ref={ref}>{children}</div>
}

const Message = memo(
  ({
    id,
    authorID,
    createdAt,
    primary,
    content,
    onResize
  }: {
    id: string
    authorID: string
    createdAt: string
    updatedAt: string
    content: string
    primary: boolean
    onResize: () => void
  }) => {
    const auth = Auth.useContainer()
    const [deleteMessageModal, setDeleteMessageModal] = useState(false)
    const [deleteMessage] = useMutation(
      async () =>
        (
          await clientGateway.delete(`/messages/${id}`, {
            headers: { Authorization: auth.token }
          })
        ).data
    )
    const user = useQuery(
      ['users', authorID],
      async (_, userID) =>
        (
          await clientGateway.get<UserResponse>(`/users/${userID}`, {
            headers: { Authorization: auth.token }
          })
        ).data
    )
    const getItems = () => {
      const items = [
        {
          text: 'Copy Message',
          icon: faCopy,
          danger: false,
          onClick: () => {
            Clipboard.write({
              string: content
            })
          }
        },
        {
          text: 'Copy ID',
          icon: faCopy,
          danger: false,
          onClick: () => {
            Clipboard.write({
              string: id
            })
          }
        }
      ]

      if (authorID === auth.id) {
        items.push({
          text: 'Delete Message',
          icon: faTrashAlt,
          danger: true,
          onClick: () => setDeleteMessageModal(true)
        })
      }
      return items
    }
    return (
      <>
        <AnimatePresence>
          {deleteMessageModal && (
            <Confirmation
              type='message'
              onConfirm={() => {
                deleteMessage()
              }}
              onDismiss={() => setDeleteMessageModal(false)}
            />
          )}
        </AnimatePresence>
        <Context id={id} key={id} items={getItems()}>
          <div className={`${styles.message} ${primary ? styles.primary : ''}`}>
            {primary && (
              <img
                className={styles.avatar}
                src={user.data?.avatar}
                alt={`${user.data?.username}'s Profile`}
              />
            )}
            <div
              className={`${styles.content} ${!primary ? styles.spacer : ''}`}
            >
              {primary && (
                <h2 key='username'>
                  {user.data?.username}
                  <span>{moment.utc(createdAt).local().calendar()}</span>
                </h2>
              )}
              <ReactMarkdown
                skipHtml={false}
                escapeHtml={true}
                unwrapDisallowed={true}
                allowedTypes={[
                  'root',
                  'text',
                  'paragraph',
                  'strong',
                  'emphasis',
                  'delete',
                  'link',
                  'heading'
                ]}
                renderers={{
                  heading: (props: { children: any }) => (
                    <p>{props.children}</p>
                  ),
                  paragraph: (props: any) => {
                    const content = props.children.flatMap((child: any) =>
                      typeof child === 'object' &&
                      child.key &&
                      !!child.key.match(/link/g) ? (
                        /^https:\/\/file\.coffee\/u\/[a-zA-Z0-9_-]{7,14}\.(png|jpeg|jpg|gif)/g.test(
                          child.props.href
                        ) ? (
                          [
                            <p>{child}</p>,
                            <div className={styles.imageEmbed}>
                              <img
                                alt='chat'
                                src={
                                  child.props.href.match(
                                    /^https:\/\/file\.coffee\/u\/[a-zA-Z0-9_-]{7,14}\.(png|jpeg|jpg|gif)$/g
                                  )?.[0]
                                }
                              />
                            </div>
                          ]
                        ) : /^https:\/\/file\.coffee\/u\/[a-zA-Z0-9_-]{7,14}\.(aac|flac|m4a|mp3|ogg|wav|mpeg)/g.test(
                          child.props.href
                        ) ? ([
                          <p>{child}</p>,
                          <div><AudioEmbed src={child.props.href} /></div>

                        ]) : (
                          <p>{child}</p>
                        )
                      ) : (
                        <p>{child}</p>
                      )
                    )
                    const paragraphs = content.filter(
                      (element: any) => element.type === 'p'
                    )
                    const images = content.filter(
                      (element: any) => element.type === 'div'
                    )
                    return (
                      <>
                        {[
                          <div key='text' className={styles.text}>
                            <p>
                              {paragraphs.flatMap(
                                (paragraph: any) => paragraph.props.children
                              )}
                            </p>
                          </div>,
                          <ImageEmbed key='images' onResize={onResize}>
                            {images.map((img: any, index: number) => (
                              <div {...img.props} key={index} />
                            ))}
                          </ImageEmbed>
                        ]}
                      </>
                    )
                  },
                  link: (props) => (
                    <a
                      href={props.href}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {props.children}
                    </a>
                  )
                }}
                source={content}
              />
            </div>
          </div>
        </Context>
      </>
    )
  }
)

export default Message
