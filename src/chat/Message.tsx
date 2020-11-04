import React, { memo, useState, useMemo } from 'react'
import styles from './Message.module.scss'
import moment from 'moment'
import { faCopy, faTrashAlt } from '@fortawesome/pro-solid-svg-icons'
import { Clipboard } from '@capacitor/core'
import { Auth } from '../authentication/state'
import { Confirmation } from '../components/Confirmation'
import { useMutation, useQuery } from 'react-query'
import { clientGateway } from '../constants'
import { AnimatePresence } from 'framer-motion'
import { UserResponse } from '../user/remote'
import { Measure } from './embeds/Measure'
import Context from '../components/Context'
import Audio from './embeds/Audio'
import Image from './embeds/Image'
import useMarkdown from '@innatical/markdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCatSpace,
  faUserNinja,
  faUserShield
} from '@fortawesome/pro-duotone-svg-icons'

type Embed = {
  embed: React.ReactNode
  link: React.ReactNode
}

const isEmbed = (element: any): element is Embed => {
  return typeof element === 'object' && element['embed'] && element['link']
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
    const output = useMarkdown(content, {
      bold: (str, key) => <strong key={key}>{str}</strong>,
      italic: (str, key) => <i key={key}>{str}</i>,
      underlined: (str, key) => <u key={key}>{str}</u>,
      strikethough: (str, key) => <del key={key}>{str}</del>,
      link: (str, key) => {
        const link = (
          <a href={str} key={key} target='_blank' rel='noopener noreferrer'>
            {str}
          </a>
        )
        if (Image.isCovfefe(str)) {
          return {
            link,
            embed: <Image.Embed key={key} url={str} />
          }
        } else if (Audio.isCovfefe(str)) {
          return {
            link,
            embed: <Audio.Embed key={key} url={str} />
          }
        } else {
          return link
        }
      },
      codeblock: (str, key) => <code key={key}>{str}</code>
    })
    const main = useMemo(
      () =>
        output.map((element) => (isEmbed(element) ? element.link : element)),
      [output]
    )
    const embeds = useMemo(
      () => output.filter(isEmbed).map((element) => element.embed),
      [output]
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
                  <span>
                    {user.data?.username}
                    {user.data?.id ===
                    '987d59ba-1979-4cc4-8818-7fe2f3d4b560' ? (
                      <FontAwesomeIcon
                        className={styles.badge}
                        icon={faUserNinja}
                      />
                    ) : user.data?.id ===
                      '99343aac-2301-415d-aece-17b021d3a459' ? (
                      <FontAwesomeIcon
                        className={styles.badge}
                        icon={faCatSpace}
                      />
                    ) : (
                      user.data?.discriminator === 0 && (
                        <FontAwesomeIcon
                          className={styles.badge}
                          icon={faUserShield}
                        />
                      )
                    )}
                  </span>
                  <span className={styles.time}>
                    {moment.utc(createdAt).local().calendar()}
                  </span>
                </h2>
              )}
              <p>{main}</p>
              <Measure onResize={onResize}>{embeds}</Measure>
            </div>
          </div>
        </Context>
      </>
    )
  }
)

export default Message

/* <ReactMarkdown
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
        Image.isCovfefe(child.props.href) ? (
          [
            // finnnne
            // make a new LS
            // can we please work on a not shit markdown parser, we can open source that ight
            // https://prod.liveshare.vsengsaas.visualstudio.com/join?65A66F804AA1DF1B833FA9B1AFB0D46D0216
            <p>{child}</p>,
            <Image.Embed url={child.props.href} />
          ]
        ) : Audio.isCovfefe(child.props.href) ? (
          [
            <p>{child}</p>,
            <div>
              <Audio.Embed src={child.props.href} />
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
          <Image.Measure key='images' onResize={onResize}>
            {images.map((img: any, index: number) => (
              <div {...img.props} key={index} />
            ))}
          </Image.Measure>
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
/> */
