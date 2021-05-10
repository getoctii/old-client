import { faVolume } from '@fortawesome/pro-solid-svg-icons'
import { FC } from 'react'
import { Auth } from '../../authentication/state'
import { ChannelResponse } from '../../chat/remote'
import Header from '../../components/Header'
import Button from '../../components/Button'
import { useUser } from '../../user/state'
import styles from './VoiceChannel.module.scss'
import { Call } from '../../state/call'
import { clientGateway } from '../../utils/constants'

const VoiceCard: FC<{ userID: string; speaking: boolean }> = ({
  userID,
  speaking
}) => {
  const user = useUser(userID)
  if (!user) return <></>
  return (
    <div
      className={styles.card}
      style={{
        backgroundImage: `url(${user.avatar})`,
        border: speaking ? '5px solid var(--neko-text-primary)' : undefined
      }}
    >
      <div className={styles.name}>
        <h1>{user.username}</h1>
      </div>
    </div>
  )
}

const VoiceChannel: FC<{ channel: ChannelResponse }> = ({ channel }) => {
  const { token } = Auth.useContainer()
  const { setRoom, play, room } = Call.useContainer()
  return (
    <div className={styles.channel}>
      <Header
        heading={channel.name}
        subheading=''
        color={'primary'}
        icon={faVolume}
        action={
          room?.channelID !== channel.id ? (
            <Button
              type='button'
              className={styles.button}
              onClick={async () => {
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
                  channelID: channel.id
                })
                play()
              }}
            >
              Join
            </Button>
          ) : (
            <></>
          )
        }
      />
      <div className={styles.grid}>
        {channel.voice_users?.map((id) => (
          <VoiceCard userID={id} speaking={false} key={id} />
        ))}
      </div>
    </div>
  )
}

export default VoiceChannel
