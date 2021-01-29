import {
  faBell,
  faBellSlash,
  faCopy,
  faHashtag,
  faTrashAlt
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
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
import { clientGateway, ModalTypes, Permissions } from '../../utils/constants'
import { useHasPermission } from '../../utils/permissions'

export const ChannelCard = ({
  channelID,
  index
}: {
  channelID: string
  index: number
}) => {
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const matchTab = useRouteMatch<{ id: string; channelID: string }>(
    '/communities/:id/channels/:channelID'
  )
  const [community, hasPermissions] = useHasPermission(match?.params.id)
  const history = useHistory()
  const [mutedChannels, setMutedChannels] = useSuspenseStorageItem<string[]>(
    'muted-channels',
    []
  )

  const ui = UI.useContainer()
  const auth = Auth.useContainer()
  const { data: channel } = useQuery(
    ['channel', channelID, auth.token],
    getChannel
  )
  const [deleteChannel] = useMutation(
    async () =>
      (
        await clientGateway.delete(`/channels/${channelID}`, {
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
      <>
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
            matchTab?.params.channelID === channel.id ? styles.selected : ''
          }`}
          onClick={() => {
            history.push(`/communities/${community?.id}/channels/${channel.id}`)
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
      </>
    </Context.Wrapper>
  )
}
