import { faVolume } from '@fortawesome/pro-solid-svg-icons'
import { FC } from 'react'
import { Auth } from '../../authentication/state'
import { ChannelResponse } from '../../chat/remote'
import Header from '../../components/Header'
import Button from '../../components/Button'
import { UserResponse } from '../../user/remote'
import { useUser } from '../../user/state'
import styles from './VoiceChannel.module.scss'
import { Call } from '../../state/call'
import { clientGateway } from '../../utils/constants'

const VoiceCard: FC<{ user: UserResponse; speaking: boolean }> = ({
  user,
  speaking
}) => {
  return (
    <div
      className={styles.card}
      style={{
        backgroundImage: `url(${user.avatar})`,
        border: speaking ? '5px solid var(--neko-text-primary)' : undefined
      }}
    />
  )
}

const VoiceChannel: FC<{ channel: ChannelResponse }> = ({ channel }) => {
  const { id, token } = Auth.useContainer()
  const { setRoom, play } = Call.useContainer()
  const user = useUser(id ?? undefined)
  if (!user) return <></>

  return (
    <div className={styles.channel}>
      <Header
        heading={channel.name}
        subheading=''
        color={'primary'}
        icon={faVolume}
        action={
          <Button
            type='button'
            className={styles.button}
            onClick={async () => {
              const {
                data
              }: {
                data: { room_id: string; token: string }
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
                id: data.room_id
              })
              play()
            }}
          >
            Join
          </Button>
        }
      />
      <div className={styles.grid}>
        {new Array(100).fill(0).map(() => {
          return <VoiceCard user={user} speaking />
        })}
      </div>
    </div>
  )
}

export default VoiceChannel
