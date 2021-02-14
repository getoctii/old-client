import {
  faBell,
  faBellSlash,
  faCopy,
  faHashtag,
  faTrashAlt
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { memo, Suspense, useCallback, useMemo } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import { Clipboard } from '@capacitor/core'
import Context from '../../components/Context'
import styles from './ChannelCard.module.scss'
import { useMutation, useQuery } from 'react-query'
import { getChannel } from '../../chat/remote'
import { getMentions, getUnreads } from '../../user/remote'
import { useSuspenseStorageItem } from '../../utils/storage'
import { UI } from '../../state/ui'
import {
  ChannelTypes,
  clientGateway,
  ModalTypes,
  Permissions
} from '../../utils/constants'
import { Permission } from '../../utils/permissions'
import { Draggable } from '@react-forked/dnd'

const ChannelCardDraggable = memo(
  ({ id, index }: { id: string; index: number }) => {
    const { hasPermissions } = Permission.useContainer()

    const draggableChild = useCallback(
      (provided, snapshot) => (
        <div
          className={`${styles.draggable} ${
            !!snapshot.isDragging ? styles.dragging : ''
          }`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
        >
          <Suspense fallback={<ChannelCardPlaceholder />}>
            <ChannelCardView id={id} index={index} />
            {provided.placeholder}
          </Suspense>
        </div>
      ),
      [id, index]
    )
    return (
      <Draggable
        draggableId={id}
        index={index}
        isDragDisabled={!hasPermissions([Permissions.MANAGE_CHANNELS])}
      >
        {draggableChild}
      </Draggable>
    )
  }
)

const ChannelCardView = ({ id, index }: { id: string; index: number }) => {
  const matchTab = useRouteMatch<{ id: string; channelID: string }>(
    '/communities/:id/channels/:channelID'
  )
  const { community, hasPermissions } = Permission.useContainer()
  const history = useHistory()
  const [mutedChannels, setMutedChannels] = useSuspenseStorageItem<string[]>(
    'muted-channels',
    []
  )

  const ui = UI.useContainer()
  const auth = Auth.useContainer()
  const { data: channel } = useQuery(['channel', id, auth.token], getChannel)
  const [deleteChannel] = useMutation(
    async () =>
      (
        await clientGateway.delete(`/channels/${id}`, {
          headers: { Authorization: auth.token }
        })
      ).data
  )
  const getItems = useCallback(
    (channelID: string) => {
      const items = [
        {
          text: mutedChannels?.includes(channelID)
            ? 'Unmute Channel'
            : 'Mute Channel',
          icon: mutedChannels?.includes(channelID) ? faBellSlash : faBell,
          danger: false,
          onClick: () => {
            if (!channelID) return
            if (mutedChannels?.includes(channelID))
              setMutedChannels(
                mutedChannels.filter((channels) => channels !== channelID)
              )
            else setMutedChannels([...(mutedChannels || []), channelID])
          }
        },
        {
          text: 'Copy ID',
          icon: faCopy,
          danger: false,
          onClick: async () => {
            await Clipboard.write({
              string: channelID
            })
          }
        }
      ]

      if (hasPermissions([Permissions.MANAGE_CHANNELS])) {
        items.push({
          text: 'Delete Channel',
          icon: faTrashAlt,
          danger: true,
          onClick: () =>
            ui.setModal({
              name: ModalTypes.DELETE_CHANNEL,
              props: {
                type: 'channel',
                onConfirm: async () => {
                  await deleteChannel()
                  ui.clearModal()
                }
              }
            })
        })
      }
      return items
    },
    [mutedChannels, setMutedChannels, deleteChannel, ui, hasPermissions]
  )
  const unreads = useQuery(['unreads', auth.id, auth.token], getUnreads)
  const mentions = useQuery(['mentions', auth.id, auth.token], getMentions)

  const mentionsCount = useMemo(
    () =>
      channel &&
      mentions.data?.[channel.id]?.filter((mention) => !mention.read).length,
    [mentions, channel]
  )

  if (!channel) return <></>

  return (
    <Context.Wrapper
      title={community?.name ?? ''}
      message={`#${channel.name}`}
      key={channel.id}
      items={getItems(channel.id)}
    >
      <div
        className={
          channel.type === ChannelTypes.CATEGORY ? styles.category : ''
        }
      >
        {index !== 0 && (
          <hr
            className={
              matchTab?.params.channelID === channel.id ? styles.hidden : ''
            }
          />
        )}
        <div
          style={
            matchTab?.params.channelID === channel.id
              ? channel.color !== '#0081FF'
                ? {
                    backgroundColor: channel.color
                  }
                : {
                    background: 'var(--neko-colors-primary)'
                  }
              : {}
          }
          className={`${styles.channel} ${
            matchTab?.params.channelID === channel.id &&
            channel.type === ChannelTypes.TEXT
              ? styles.selected
              : ''
          }`}
          onClick={() => {
            if (
              matchTab?.params.channelID === channel.id ||
              channel.type !== ChannelTypes.TEXT
            )
              return
            return history.push(
              `/communities/${community?.id}/channels/${channel.id}`
            )
          }}
        >
          <h4>
            <div
              className={styles.icon}
              style={
                channel.color !== '#0081FF'
                  ? {
                      backgroundColor: channel.color
                    }
                  : {
                      background: 'var(--neko-colors-primary)'
                    }
              }
            >
              <FontAwesomeIcon
                icon={faHashtag}
                fixedWidth={true}
                style={
                  matchTab?.params.channelID === channel.id
                    ? channel.color
                      ? {
                          color: channel.color
                        }
                      : {
                          color: 'var(--neko-text-href)'
                        }
                    : {}
                }
              />
            </div>
            {channel.name}
            <div className={styles.indicators}>
              {!(matchTab?.params.channelID === channel.id) &&
                (mentionsCount && mentionsCount > 0 ? (
                  <div
                    className={`${styles.mention} ${
                      mentionsCount > 9 ? styles.pill : ''
                    }`}
                  >
                    <span>{mentionsCount > 999 ? '999+' : mentionsCount}</span>
                  </div>
                ) : unreads.data?.[channel.id]?.last_message_id !==
                  unreads.data?.[channel.id]?.read ? (
                  <div className={styles.unread} />
                ) : (
                  <></>
                ))}
              {mutedChannels?.includes(channel.id) && (
                <FontAwesomeIcon
                  className={styles.muted}
                  icon={faBellSlash}
                  fixedWidth
                />
              )}
            </div>
          </h4>
        </div>
      </div>
    </Context.Wrapper>
  )
}

const ChannelCardPlaceholder = ({ index }: { index?: number }) => {
  const name = useMemo(() => Math.floor(Math.random() * 5) + 3, [])
  return (
    <>
      {index !== 0 && <hr />}
      <div className={styles.channelPlaceholder}>
        <div className={styles.icon} />
        <div className={styles.text} style={{ width: `${name}rem` }} />
      </div>
    </>
  )
}

const ChannelCard = {
  View: ChannelCardView,
  Placeholder: ChannelCardPlaceholder,
  Draggable: ChannelCardDraggable
}

export default ChannelCard
