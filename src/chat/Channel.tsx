import React, { Suspense, useMemo, useState } from 'react'
import styles from './Channel.module.scss'
import { queryCache, useMutation, useQuery } from 'react-query'
import { ChannelTypes, clientGateway } from '../utils/constants'
import { Auth } from '../authentication/state'
import { useDropArea } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faHashtag,
  faPhoneRotary,
  faPhoneSlash
} from '@fortawesome/pro-solid-svg-icons'
import { useMedia } from 'react-use'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import Box from './Box'
import Typing from '../state/typing'
import { Call } from '../state/call'
import Button from '../components/Button'
import { getChannel } from './remote'
import Messages from './Messages'
import { getUser } from '../user/remote'

const TypingIndicator = ({ channelID }: { channelID: string }) => {
  const { id } = Auth.useContainer()
  const { typing } = Typing.useContainer()
  const users = typing[channelID]
    ?.filter((userID) => userID[0] !== id)
    .map((t) => t[1])
  if (users?.length > 0)
    return (
      <p className={styles.typing}>
        {users?.length === 1
          ? `${users[0]} is typing...`
          : users?.length === 2
          ? `${users.join(' and ')} are typing...`
          : users?.length > 2
          ? `${users.slice(-1).join(', ')} and ${
              users[users.length - 1]
            } are typing...`
          : users?.length > 3
          ? 'A lot of people are typing...'
          : ''}
      </p>
    )
  else return <div className={styles.typingEmpty}></div>
}

const Name = ({ id, dm }: { id: string; dm: boolean }) => {
  const { token } = Auth.useContainer()
  const user = useQuery(['users', id, token], getUser)
  return (
    <>
      {user.data?.username}
      {dm
        ? `#${
            user.data?.discriminator === 0
              ? 'inn'
              : user.data?.discriminator.toString().padStart(4, '0')
          }`
        : ''}
    </>
  )
}

const View = ({
  type,
  channelID,
  participants
}: {
  type: ChannelTypes
  channelID: string
  participants?: string[]
}) => {
  const { token, id } = Auth.useContainer()
  const call = Call.useContainer()
  const { typing } = Typing.useContainer()
  const users = typing[channelID]
    ?.filter((userID) => userID[0] !== id)
    .map((t) => t[1])
  const [tracking, setTracking] = useState(true)
  const [autoRead, setAutoRead] = useState(false)
  const [sendMessage] = useMutation(async (content: string) => {
    const data = (
      await clientGateway.post(
        `/channels/${channelID}/messages`,
        new URLSearchParams({ content }),
        { headers: { Authorization: token } }
      )
    ).data
    queryCache.setQueryData(['channel', channel.data?.id, token], (c: any) => ({
      ...c,
      read: data.id
    }))
    if (tracking) setAutoRead(true)
  })

  const isMobile = useMedia('(max-width: 940px)')
  const history = useHistory()

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axios.post(
      'https://covfefe.innatical.com/api/v1/upload',
      formData
    )
    await sendMessage(response.data.url)
  }

  const postTyping = async () => {
    clientGateway.post(`/channels/${channelID}/typing`, undefined, {
      headers: {
        Authorization: token
      }
    })
  }

  const channel = useQuery(['channel', channelID, token], getChannel)

  const [bond] = useDropArea({
    onFiles: (files) => uploadFile(files[0])
  })

  return (
    <Suspense fallback={<Placeholder />}>
      <div className={styles.chat} {...bond}>
        <div className={styles.header}>
          {isMobile ? (
            <div
              className={styles.icon}
              onClick={() => isMobile && history.goBack()}
            >
              <FontAwesomeIcon
                className={styles.backButton}
                icon={faChevronLeft}
              />
            </div>
          ) : (
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faHashtag} />
            </div>
          )}
          <div className={styles.title}>
            {type === ChannelTypes.PrivateChannel
              ? participants?.map((i) => (
                  <Name id={i} dm={type === ChannelTypes.PrivateChannel} />
                ))
              : channel.data?.name}
            <p className={styles.status}>{channel.data?.description}</p>
          </div>
          {type === ChannelTypes.PrivateChannel && participants ? (
            [0] &&
            call.otherUserID !== participants[0] && (
              <Button
                type='button'
                onClick={() => {
                  console.log('calling uwu')
                  if (call.callState !== 'idle') call.endCall()
                  call.ringUser(participants[0])
                }}
              >
                {call.callState !== 'idle' ? (
                  <FontAwesomeIcon icon={faPhoneSlash} />
                ) : (
                  <FontAwesomeIcon icon={faPhoneRotary} />
                )}
              </Button>
            )
          ) : (
            <></>
          )}
        </div>
        {channel.data ? (
          <Messages.View
            channel={channel.data}
            onTrackChange={(t) => {
              setTracking(t)
              setAutoRead(false)
            }}
            autoRead={autoRead}
          />
        ) : (
          <Messages.Placeholder />
        )}
        <Box.View
          {...{
            sendMessage,
            uploadFile,
            postTyping,
            typingIndicator: users?.length > 0
          }}
        />
        <TypingIndicator channelID={channelID} />
      </div>
    </Suspense>
  )
}

const Placeholder = () => {
  const username = useMemo(() => Math.floor(Math.random() * 6) + 3, [])
  const status = useMemo(() => Math.floor(Math.random() * 10) + 8, [])
  return (
    <div className={styles.placeholder}>
      <div className={styles.header}>
        <div className={styles.icon} />
        <div className={styles.title}>
          <div className={styles.name} style={{ width: `${username}rem` }} />
          <div className={styles.status} style={{ width: `${status}rem` }} />
        </div>
      </div>
      <Messages.Placeholder />
      <br />
      <Box.Placeholder />
    </div>
  )
}

const Channel = { View, Placeholder }

export default Channel
