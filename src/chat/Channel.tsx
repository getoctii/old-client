import React, { Suspense, useEffect, useMemo } from 'react'
import styles from './Channel.module.scss'
import { useQuery } from 'react-query'
import { ChannelTypes, ModalTypes, Permissions } from '../utils/constants'
import { Auth } from '../authentication/state'
import { useDropArea, useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faHashtag,
  faPhone,
  faPhoneSlash,
  faUserPlus
} from '@fortawesome/pro-solid-svg-icons'
import { useHistory, useParams } from 'react-router-dom'
import Box from './Box'
import Typing from '../state/typing'
import { Call } from '../state/call'
import Button from '../components/Button'
import { ChannelResponse, getChannel } from './remote'
import Messages from './Messages'
import { fetchManyUsers, getUser } from '../user/remote'
import { Chat } from './state'
import { UI } from '../state/ui'
import { Permission } from '../utils/permissions'

const TypingIndicator = ({ channelID }: { channelID: string }) => {
  const { id } = Auth.useContainer()
  const { typing } = Typing.useContainer()
  const users = useMemo(
    () =>
      typing[channelID]?.filter((userID) => userID[0] !== id).map((t) => t[1]),
    [typing, channelID, id]
  )
  if (users?.length > 0) {
    return (
      <p className={styles.typing}>
        {users?.length === 1
          ? `${users[0]} is typing...`
          : users?.length === 2
          ? `${users.join(' and ')} are typing...`
          : users?.length === 3
          ? `${users.slice(0, 2).join(', ')} and ${
              users[users.length - 1]
            } are typing...`
          : users?.length > 3
          ? 'A lot of people are typing...'
          : ''}
      </p>
    )
  } else return <div className={styles.typingEmpty} />
}

const PrivateName = ({ id }: { id?: string }) => {
  const { token } = Auth.useContainer()
  const user = useQuery(['users', id, token], getUser)
  return (
    <div className={styles.title}>
      {user.data?.username}#
      {user.data?.discriminator === 0
        ? 'inn'
        : user.data?.discriminator.toString().padStart(4, '0')}
      <p className={styles.status}>{user.data?.status}</p>
    </div>
  )
}

const Header = ({
  participants,
  type,
  channel
}: {
  participants?: string[]
  type: ChannelTypes
  channel?: ChannelResponse
}) => {
  const { token } = Auth.useContainer()
  const { data: users } = useQuery(
    ['users', participants ?? [], token],
    fetchManyUsers
  )

  return (
    <div className={styles.title}>
      {type === ChannelTypes.PrivateChannel ? (
        <PrivateName id={participants?.[0]} />
      ) : type === ChannelTypes.GroupChannel ? (
        users?.map((i) => i.username).join(', ')
      ) : (
        channel?.name
      )}
      <p className={styles.status}>{channel?.description}</p>
    </div>
  )
}

const CommunityChannelView = () => {
  const { id, channelID } = useParams<{ id: string; channelID: string }>()
  return (
    <ChannelView
      type={ChannelTypes.CommunityChannel}
      channelID={channelID}
      communityID={id}
    />
  )
}

const supportedFiles = new Set(['image/png', 'image/gif', 'image/jpeg'])
const ChannelView = ({
  type,
  channelID,
  participants,
  communityID,
  conversationID
}: {
  type: ChannelTypes
  channelID: string
  participants?: string[]
  communityID?: string
  conversationID?: string
}) => {
  const {
    autoRead,
    setTracking,
    setAutoRead,
    setChannelID,
    setUploadDetails
  } = Chat.useContainer()
  const { token, id } = Auth.useContainer()
  const call = Call.useContainer()
  const uiStore = UI.useContainer()
  const { typing } = Typing.useContainer()
  const typingUsers = typing[channelID]
    ?.filter((userID) => userID[0] !== id)
    .map((t) => t[1])

  const isMobile = useMedia('(max-width: 740px)')
  const history = useHistory()

  const channel = useQuery(['channel', channelID, token], getChannel)
  const { hasPermissions } = Permission.useContainer()
  const [bond] = useDropArea({
    onFiles: (files) => {
      if (supportedFiles.has(files[0].type))
        setUploadDetails({
          status: 'pending',
          file: files[0]
        })
    }
  })

  useEffect(() => {
    setChannelID(channelID)
    setTracking(true)
    setAutoRead(false)
  }, [setAutoRead, setTracking, setChannelID, channelID, type])

  return (
    <Suspense fallback={<ChannelPlaceholder />}>
      <div className={styles.chat} {...bond}>
        <div className={styles.header}>
          {isMobile ? (
            <div
              className={styles.icon}
              onClick={() => {
                if (isMobile) {
                  if (type === ChannelTypes.CommunityChannel) {
                    history.push(`/communities/${channel.data?.community_id}`)
                  } else {
                    history.push('/')
                  }
                }
              }}
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
          <Suspense fallback={<></>}>
            <Header
              type={type}
              participants={participants}
              channel={channel.data}
            />
          </Suspense>
          <div className={styles.buttonGroup}>
            {type === ChannelTypes.PrivateChannel ||
            type === ChannelTypes.GroupChannel ? (
              <Button
                type='button'
                onClick={() => {
                  uiStore.setModal({
                    name: ModalTypes.ADD_PARTICIPANT,
                    props: {
                      participant:
                        type === ChannelTypes.PrivateChannel
                          ? participants?.[0]
                          : undefined,
                      isPrivate: type === ChannelTypes.PrivateChannel,
                      groupID:
                        type === ChannelTypes.GroupChannel
                          ? conversationID
                          : undefined
                    }
                  })
                }}
              >
                <FontAwesomeIcon icon={faUserPlus} />
              </Button>
            ) : (
              <></>
            )}
            {type === ChannelTypes.PrivateChannel && participants ? (
              call.otherUserID !== participants[0] && [0] && (
                <Button
                  type='button'
                  onClick={async () => {
                    if (call.callState !== 'idle') call.endCall()
                    await call.ringUser(participants[0])
                  }}
                >
                  {call.callState !== 'idle' ? (
                    <FontAwesomeIcon icon={faPhoneSlash} />
                  ) : (
                    <FontAwesomeIcon icon={faPhone} />
                  )}
                </Button>
              )
            ) : (
              <></>
            )}
          </div>

          <div className={styles.bg} />
        </div>
        <Suspense fallback={<Messages.Placeholder />}>
          {channel.data ? (
            <Messages.View channel={channel.data} autoRead={autoRead} />
          ) : (
            <Messages.Placeholder />
          )}
        </Suspense>
        <Box.View
          {...{
            hasPermission:
              type === ChannelTypes.CommunityChannel
                ? hasPermissions([Permissions.SEND_MESSAGES])
                : true,
            participants,
            channelID,
            typingIndicator: typingUsers?.length > 0,
            communityID
          }}
        />
        <TypingIndicator channelID={channelID} />
      </div>
    </Suspense>
  )
}

const ChannelPlaceholder = () => {
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

const Channel = {
  View: ChannelView,
  Community: CommunityChannelView,
  Placeholder: ChannelPlaceholder
}

export default Channel
