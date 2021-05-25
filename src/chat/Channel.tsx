import { FC, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import styles from './Channel.module.scss'
import { useQuery } from 'react-query'
import {
  ChannelPermissions,
  clientGateway,
  InternalChannelTypes
} from '../utils/constants'
import { Auth } from '../authentication/state'
import { useDropArea, useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDown,
  faArrowUp,
  faChevronLeft,
  faHashtag,
  faMicrophone,
  faMicrophoneSlash,
  faPhone,
  faTimes,
  faUserPlus,
  faVolume,
  faVolumeMute
} from '@fortawesome/pro-solid-svg-icons'
import { useHistory, useParams } from 'react-router-dom'
import Box from './Box'
import Typing from '../state/typing'
import Button from '../components/Button'
import { ChannelResponse, getChannel } from './remote'
import Messages from './Messages'
import { fetchManyUsers, getKeychain, getUser } from '../user/remote'
import { Chat } from './state'
import { Permission } from '../utils/permissions'
import AddParticipant from './AddParticipant'
import { importPublicKey } from '@innatical/inncryption'
import { VoiceCard } from '../community/voice/VoiceChannel'
import { Call } from '../state/call'

const TypingIndicator: FC<{
  channelID: string
}> = ({ channelID }) => {
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

const PrivateName: FC<{ id?: string }> = ({ id }) => {
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

const Header: FC<{
  participants?: string[]
  type: InternalChannelTypes
  channel?: ChannelResponse
}> = ({ participants, type, channel }) => {
  const { token } = Auth.useContainer()
  const { data: users } = useQuery(
    ['users', participants ?? [], token],
    fetchManyUsers
  )

  return (
    <div className={styles.title}>
      {type === InternalChannelTypes.PrivateChannel ? (
        <PrivateName id={participants?.[0]} />
      ) : type === InternalChannelTypes.GroupChannel ? (
        users?.map((i) => i.username).join(', ')
      ) : (
        channel?.name
      )}
      <p className={styles.status}>{channel?.description}</p>
    </div>
  )
}

const CommunityChannelView: FC = () => {
  const { id, channelID } = useParams<{ id: string; channelID: string }>()
  return (
    <ChannelView
      type={InternalChannelTypes.CommunityChannel}
      channelID={channelID}
      communityID={id}
    />
  )
}

const VideoCard: FC<{ track: MediaStreamTrack }> = ({ track }) => {
  const ref = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const stream = new MediaStream()
    stream.addTrack(track)
    ref.current.srcObject = stream
    ref.current?.play()
  }, [ref, track])
  return <video ref={ref} className={styles.video} />
}

const CallView: FC<{ channel: ChannelResponse; conversationID: string }> = ({
  channel,
  conversationID
}) => {
  const {
    muted,
    setMuted,
    setDeafened,
    deafened,
    room,
    setRoom,
    play,
    remoteVideoTracks
  } = Call.useContainer()
  const { token } = Auth.useContainer()
  const current = useMemo(() => room?.channelID === channel.id, [room])
  const [currentVideoStream, setCurrentVideoStream] = useState(0)
  const trackLength = useMemo(
    () => remoteVideoTracks?.length ?? 0,
    [remoteVideoTracks]
  )
  return (
    <div className={styles.call}>
      <div className={styles.callContent}>
        <div
          className={`${styles.users} ${
            remoteVideoTracks?.length ?? 0 > 0 ? styles.vertical : ''
          }`}
        >
          {channel.voice_users?.map((user) => (
            <VoiceCard userID={user} speaking={false} small />
          ))}
        </div>
        {trackLength > 0 ? (
          <>
            <div className={styles.videoStreams}>
              {remoteVideoTracks ? (
                <VideoCard track={remoteVideoTracks[currentVideoStream]} />
              ) : (
                <></>
              )}
            </div>
            <div className={styles.videoButtons}>
              <Button
                type={'button'}
                onClick={() => {
                  if (currentVideoStream + 1 > trackLength - 1)
                    setCurrentVideoStream(0)
                  else setCurrentVideoStream(currentVideoStream + 1)
                }}
              >
                <FontAwesomeIcon icon={faArrowUp} />
              </Button>
              <Button
                type={'button'}
                onClick={() => {
                  console.log(currentVideoStream - 1 < 0)
                  if (currentVideoStream - 1 < 0)
                    setCurrentVideoStream(trackLength - 1)
                  else setCurrentVideoStream(currentVideoStream - 1)
                }}
              >
                <FontAwesomeIcon icon={faArrowDown} />
              </Button>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
      <div className={styles.buttons}>
        <Button type='button' onClick={() => setMuted(!muted)}>
          <FontAwesomeIcon
            icon={muted ? faMicrophoneSlash : faMicrophone}
            fixedWidth
          />
        </Button>
        <Button
          className={current ? styles.disconnect : styles.connect}
          type='button'
          onClick={async () => {
            if (current) {
              setRoom(null)
            } else {
              const {
                data
              }: {
                data: { room_id: string; token: string; server: string }
              } = await clientGateway.post(
                `/channels/${channel.id}/join`,
                {},
                {
                  headers: {
                    Authorization: token
                  }
                }
              )
              setRoom({
                token: data.token,
                id: data.room_id,
                server: data.server,
                conversationID,
                channelID: channel.id
              })
              play()
            }
          }}
        >
          {current ? 'Disconnect' : 'Connect'}
        </Button>
        <Button type='button' onClick={() => setDeafened(!deafened)}>
          <FontAwesomeIcon
            icon={deafened ? faVolumeMute : faVolume}
            fixedWidth
          />
        </Button>
      </div>
    </div>
  )
}

const supportedFiles = new Set(['image/png', 'image/gif', 'image/jpeg'])

const ChannelView: FC<{
  type: InternalChannelTypes
  channelID: string
  participants?: string[]
  communityID?: string
  conversationID?: string
  voiceChannelID?: string
}> = ({
  type,
  channelID,
  participants,
  communityID,
  conversationID,
  voiceChannelID
}) => {
  const { setUploadDetails, setPublicEncryptionKey, setPublicSigningKey } =
    Chat.useContainerSelector(
      ({ setUploadDetails, setPublicEncryptionKey, setPublicSigningKey }) => ({
        setUploadDetails,
        setPublicEncryptionKey,
        setPublicSigningKey
      })
    )

  const { token, id } = Auth.useContainer()
  const { typing } = Typing.useContainer()
  const typingUsers = useMemo(
    () =>
      typing[channelID]?.filter((userID) => userID[0] !== id).map((t) => t[1]),
    [typing, channelID, id]
  )

  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const isMobile = useMedia('(max-width: 740px)')
  const history = useHistory()

  const { data: channel } = useQuery(['channel', channelID, token], getChannel)
  const { data: voiceChannel } = useQuery(
    ['channel', voiceChannelID, token],
    getChannel,
    {
      enabled: !!voiceChannelID
    }
  )
  const { hasChannelPermissions } = Permission.useContainer()
  const [bond] = useDropArea({
    onFiles: (files) => {
      if (supportedFiles.has(files[0].type))
        setUploadDetails({
          status: 'pending',
          file: files[0]
        })
    }
  })

  const { data: otherKeychain } = useQuery(
    [
      'keychain',
      type === InternalChannelTypes.PrivateChannel ? participants?.[0] : null,
      token
    ],
    getKeychain
  )

  const { data: publicKey } = useQuery(
    ['publicKey', otherKeychain?.signing.publicKey],
    async (_: string, key: number[]) => {
      if (!key) return undefined
      return await importPublicKey(key, 'signing')
    }
  )

  useEffect(() => {
    ;(async () => {
      if (!otherKeychain || !publicKey) return
      setPublicEncryptionKey(
        await importPublicKey(otherKeychain.encryption.publicKey, 'encryption')
      )
      setPublicSigningKey(publicKey)
    })()

    return () => {
      setPublicEncryptionKey(null)
    }
  }, [otherKeychain, setPublicEncryptionKey, setPublicSigningKey, publicKey])

  const { setRoom, play, room } = Call.useContainer()

  return (
    <Suspense fallback={<ChannelPlaceholder />}>
      <div className={styles.chat} {...bond}>
        <div className={styles.header}>
          <div className={styles.heading}>
            {isMobile ? (
              <div
                className={styles.icon}
                style={
                  channel?.color !== '#0081FF'
                    ? {
                        backgroundColor: channel?.color
                      }
                    : {
                        background: 'var(--neko-colors-primary)'
                      }
                }
                onClick={() => {
                  if (isMobile) {
                    if (type === InternalChannelTypes.CommunityChannel) {
                      history.push(`/communities/${channel?.community_id}`)
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
              <div
                className={styles.icon}
                style={
                  channel?.color !== '#0081FF'
                    ? {
                        backgroundColor: channel?.color
                      }
                    : {
                        background: 'var(--neko-colors-primary)'
                      }
                }
              >
                <FontAwesomeIcon icon={faHashtag} />
              </div>
            )}
            <Suspense fallback={<></>}>
              <Header
                type={type}
                participants={participants}
                channel={channel}
              />
            </Suspense>
            <div className={styles.buttonGroup}>
              {voiceChannel && room?.channelID !== voiceChannel.id ? (
                <Button
                  type='button'
                  onClick={async () => {
                    if (!voiceChannel) return
                    const {
                      data
                    }: {
                      data: { room_id: string; token: string; server: string }
                    } = await clientGateway.post(
                      `/channels/${voiceChannel.id}/join`,
                      {},
                      {
                        headers: {
                          Authorization: token
                        }
                      }
                    )
                    setRoom({
                      token: data.token,
                      id: data.room_id,
                      server: data.server,
                      conversationID,
                      channelID: voiceChannelID
                    })
                    play()
                  }}
                >
                  <FontAwesomeIcon icon={faPhone} />
                </Button>
              ) : (
                <></>
              )}
              {type === InternalChannelTypes.PrivateChannel ||
              type === InternalChannelTypes.GroupChannel ? (
                <Button
                  type='button'
                  onClick={() => {
                    setShowAddParticipant(!showAddParticipant)
                  }}
                >
                  <FontAwesomeIcon
                    icon={showAddParticipant ? faTimes : faUserPlus}
                  />
                </Button>
              ) : (
                <></>
              )}
            </div>
            {showAddParticipant && (
              <AddParticipant
                isPrivate={type === InternalChannelTypes.PrivateChannel}
                groupID={
                  type === InternalChannelTypes.GroupChannel
                    ? conversationID
                    : undefined
                }
                participant={participants?.[0]}
              />
            )}
          </div>
          {voiceChannel && (voiceChannel.voice_users?.length ?? 0) > 0 ? (
            <CallView channel={voiceChannel} conversationID={conversationID!} />
          ) : (
            <></>
          )}
        </div>
        <Suspense fallback={<Messages.Placeholder />}>
          {channel ? (
            <Messages.View channel={channel} />
          ) : (
            <Messages.Placeholder />
          )}
        </Suspense>
        <Box.View
          {...{
            hasPermission:
              type === InternalChannelTypes.CommunityChannel && channel
                ? hasChannelPermissions(
                    [ChannelPermissions.SEND_MESSAGES],
                    channel
                  )
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

const ChannelPlaceholder: FC = () => {
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
