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
import { CommunityResponse } from '../remote'
import { Clipboard } from '@capacitor/core'
import Context from '../../components/Context'
import styles from './ChannelCard.module.scss'
import { useQuery } from 'react-query'
import { getChannel } from '../../chat/remote'
import { getMentions, getUnreads } from '../../user/remote'
import { useSuspenseStorageItem } from '../../utils/storage'

export const ChannelCard = ({
  channelID,
  index,
  community,
  setShowDelete
}: {
  channelID: string
  index: number
  community: CommunityResponse
  setShowDelete: (value: string) => void
}) => {
  const match = useRouteMatch<{ id: string; channelID: string }>(
    '/communities/:id/channels/:channelID'
  )
  const history = useHistory()
  const [mutedChannels, setMutedChannels] = useSuspenseStorageItem<string[]>(
    'muted-channels',
    []
  )
  const auth = Auth.useContainer()
  const { data: channel } = useQuery(
    ['channel', channelID, auth.token],
    getChannel
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
          onClick: () => {
            Clipboard.write({
              string: channelID
            })
          }
        }
      ]

      if (community?.owner_id === auth.id) {
        items.push({
          text: 'Delete Channel',
          icon: faTrashAlt,
          danger: true,
          onClick: () => setShowDelete(channelID)
        })
      }
      return items
    },
    [mutedChannels, auth, community, setMutedChannels, setShowDelete]
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
      title={community.name}
      message={`#${channel.name}`}
      key={channel.id}
      items={getItems(channel.id)}
    >
      <>
        {index !== 0 && (
          <hr
            className={
              match?.params.channelID === channel.id ? styles.hidden : ''
            }
          />
        )}
        <div
          style={
            match?.params.channelID === channel.id
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
            match?.params.channelID === channel.id ? styles.selected : ''
          }`}
          onClick={() => {
            history.push(`/communities/${community.id}/channels/${channel.id}`)
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
                  match?.params.channelID === channel.id
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
              {!(match?.params.channelID === channel.id) &&
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
