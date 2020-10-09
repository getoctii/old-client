import React, { useEffect, memo, ReactChildren, useState } from 'react'
import styles from './Message.module.scss'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import { useMeasure } from 'react-use'
import { faCopy, faTrashAlt } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Clipboard } from '@capacitor/core'
import { ContextMenuTrigger, ContextMenu, MenuItem } from 'react-contextmenu'
import { Auth } from '../authentication/state'
import { Confirmation } from '../components/Confirmation'
import { useMutation } from 'react-query'
import { clientGateway } from '../constants'
import { AnimatePresence } from 'framer-motion'

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
    author,
    created_at,
    primary,
    content,
    onResize
  }: {
    id: string
    author: {
      id: string
      username: string
      avatar: string
      discriminator: number
    }
    created_at: string
    updated_at: string
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
        <ContextMenuTrigger id={id}>
          <div className={primary ? styles.primary : styles.message}>
            {primary && (
              <img
                className={styles.avatar}
                src={author.avatar}
                alt={`${author}'s Profile`}
              />
            )}
            <div
              className={`${styles.content} ${!primary ? styles.spacer : ''}`}
            >
              {primary && (
                <h2 key='username'>
                  {author.username}
                  <span>{moment.utc(created_at).local().calendar()}</span>
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
                  heading: (props) => <p>{props.children}</p>,
                  paragraph: (props) => {
                    const content = props.children.flatMap(
                      (child: any, index: number) =>
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
                          ) : (
                            <p>{child}</p>
                          )
                        ) : (
                          <p>{child}</p>
                        )
                    )
                    const paragraphs = content.filter(
                      (e: any) => e.type === 'p'
                    )
                    const images = content.filter((e: any) => e.type === 'div')
                    return (
                      <>
                        {[
                          <div key='text'>
                            <p>
                              {paragraphs.flatMap((p: any) => p.props.children)}
                            </p>
                          </div>,
                          <ImageEmbed key='images' onResize={onResize}>
                            {images.map((img: any, index: any) => (
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
        </ContextMenuTrigger>
        <ContextMenu
          key={`context-${id}`}
          id={id}
          className={styles.contextMenu}
        >
          <MenuItem
            key={`copy-message-${id}`}
            onClick={() => {
              Clipboard.write({
                string: content
              })
            }}
          >
            <span>Copy Message</span>
            <FontAwesomeIcon fixedWidth icon={faCopy} />
          </MenuItem>
          <MenuItem
            key={`copy-id-${id}`}
            onClick={() => {
              Clipboard.write({
                string: id
              })
            }}
          >
            <span>Copy ID</span>
            <FontAwesomeIcon fixedWidth icon={faCopy} />
          </MenuItem>
          {author.id === auth.id && (
            <>
              <hr />
              <MenuItem
                key={`delete-${id}`}
                className={styles.danger}
                onClick={() => setDeleteMessageModal(true)}
              >
                <span>Delete Message</span>
                <FontAwesomeIcon fixedWidth icon={faTrashAlt} />
              </MenuItem>
            </>
          )}
        </ContextMenu>
      </>
    )
  }
)

export default Message
