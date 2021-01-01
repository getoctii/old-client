import React, { memo, useState, useMemo, Suspense } from 'react'
import styles from './Message.module.scss'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import { faCopy, faTrashAlt } from '@fortawesome/pro-solid-svg-icons'
import { Clipboard } from '@capacitor/core'
import { Auth } from '../authentication/state'
import { Confirmation } from '../components/Confirmation'
import { useMutation, useQuery } from 'react-query'
import { clientGateway } from '../utils/constants'
import { AnimatePresence } from 'framer-motion'
import { getUser } from '../user/remote'
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
import { ErrorBoundary } from 'react-error-boundary'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

type Embed = {
  embed: React.ReactNode
  link: React.ReactNode
}

const isEmbed = (element: any): element is Embed => {
  return typeof element === 'object' && element['embed'] && element['link']
}

const Mention = ({
  userID,
  selected
}: {
  userID: string
  selected?: boolean
}) => {
  const { token, id } = Auth.useContainer()
  const user = useQuery(['users', userID, token], getUser)
  return (
    <span
      className={`${styles.mention} ${userID === id ? styles.isMe : ''} ${
        selected ? styles.selected : ''
      }`}
    >
      @{user.data?.username}
    </span>
  )
}

const View = memo(
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
    const user = useQuery(['users', authorID, auth.token], getUser)
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
      codeblock: (str, key) => <code key={key}>{str}</code>,
      custom: [
        [
          /<@([A-Za-z0-9-]+?)>/g,
          (str, key) => (
            <Suspense fallback={<>&lt;@{str}&gt;</>}>
              <ErrorBoundary fallbackRender={() => <>&lt;@{str}&gt;</>}>
                <Mention key={key} userID={str} />
              </ErrorBoundary>
            </Suspense>
          )
        ]
      ]
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
        <Context.Wrapper key={id} items={getItems()}>
          <div className={`${styles.message} ${primary ? styles.primary : ''}`}>
            {primary && (
              <div
                className={styles.avatar}
                style={{ backgroundImage: `url(${user.data?.avatar})` }}
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
                    {dayjs.utc(createdAt).local().calendar()}
                  </span>
                </h2>
              )}
              <p>{main}</p>
              <Measure onResize={onResize}>{embeds}</Measure>
            </div>
          </div>
        </Context.Wrapper>
      </>
    )
  }
)

const Placeholder = () => {
  const username = useMemo(() => Math.floor(Math.random() * 6) + 3, [])
  const message = useMemo(() => Math.floor(Math.random() * 10) + 8, [])
  const isPrimary = useMemo(() => Math.floor(Math.random() * 1000000) + 1, [])
  return (
    <div
      className={`${styles.placeholder} ${
        isPrimary % 2 === 0 ? styles.primary : ''
      }`}
    >
      {isPrimary % 2 === 0 && <div className={styles.avatar} />}
      <div
        className={`${styles.content} ${
          isPrimary % 2 !== 0 ? styles.spacer : ''
        }`}
      >
        <div className={styles.user}>
          {isPrimary % 2 === 0 && (
            <div
              className={styles.username}
              style={{ width: `${username}rem` }}
            />
          )}
          {isPrimary % 2 === 0 && <div className={styles.date} />}
        </div>
        <div className={styles.message} style={{ width: `${message}rem` }} />
      </div>
    </div>
  )
}

const Message = { View, Placeholder, Mention }

export default Message
