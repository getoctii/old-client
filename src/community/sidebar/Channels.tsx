import {
  faPlus,
  faHashtag,
  faCopy,
  faTrashAlt,
  faBellSlash,
  faBell
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import { CommunityResponse } from '../remote'
import styles from './Channels.module.scss'
import { Clipboard } from '@capacitor/core'
import { AnimatePresence } from 'framer-motion'
import { NewChannel } from '../NewChannel'
import { Confirmation } from '../../components/Confirmation'
import { useMutation } from 'react-query'
import { clientGateway } from '../../constants'
import { useLocalStorage } from 'react-use'
import Context from '../../components/Context'

const View = ({ community }: { community?: CommunityResponse }) => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string; channelID: string }>(
    '/communities/:id/channels/:channelID'
  )
  const history = useHistory()
  const [mutedChannels, setMutedChannels] = useLocalStorage<string[]>(
    'muted_channels',
    []
  )
  const [showCreate, setShowCreate] = useState(false)
  const [showDelete, setShowDelete] = useState<string | undefined>(undefined)
  const [deleteChannel] = useMutation(
    async (channelID: string) =>
      (
        await clientGateway.delete(`/channels/${channelID}`, {
          headers: { Authorization: auth.token }
        })
      ).data
  )
  const getItems = (channelID: string) => {
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
  }
  return (
    <div className={styles.channels}>
      <AnimatePresence>
        {showCreate && (
          <NewChannel
            community={community}
            onDismiss={() => setShowCreate(false)}
          />
        )}
        {showDelete && (
          <Confirmation
            type='channel'
            onConfirm={() => {
              deleteChannel(showDelete)
              setShowDelete(undefined)
            }}
            onDismiss={() => setShowDelete(undefined)}
          />
        )}
      </AnimatePresence>
      <h4>
        Rooms
        {community?.owner_id === auth.id && (
          <span>
            <FontAwesomeIcon
              className={styles.add}
              icon={faPlus}
              onClick={() => setShowCreate(true)}
            />
          </span>
        )}
      </h4>
      <div className={styles.list}>
        {community && community.channels.length > 0 ? (
          community.channels.map((channel, index) => (
            <Context
              id={channel.id}
              key={channel.id}
              items={getItems(channel.id)}
            >
              <>
                {index !== 0 && (
                  <hr
                    className={
                      match?.params.channelID === channel.id
                        ? styles.hidden
                        : ''
                    }
                  />
                )}
                <div
                  style={
                    match?.params.channelID === channel.id
                      ? channel.color
                        ? {
                            backgroundColor: channel.color
                          }
                        : {
                            background: 'var(--neko-colors-primary)'
                          }
                      : {}
                  }
                  className={`${styles.channel} ${
                    match?.params.channelID === channel.id
                      ? styles.selected
                      : ''
                  }`}
                  onClick={() => {
                    history.push(
                      `/communities/${community.id}/channels/${channel.id}`
                    )
                  }}
                >
                  <h4>
                    <div
                      className={styles.icon}
                      style={
                        channel.color
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
                    {mutedChannels?.includes(channel.id) && (
                      <FontAwesomeIcon
                        className={styles.muted}
                        icon={faBellSlash}
                        fixedWidth
                      />
                    )}
                  </h4>
                </div>
              </>
            </Context>
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

const Placeholder = () => {
  return (
    <div className={styles.placeholder}>
      <div className={styles.rooms} />
      <div className={styles.channel}>
        <div className={styles.icon} />
        <div className={styles.text} />
      </div>
      <hr />
      <div className={styles.channel}>
        <div className={styles.icon} />
        <div className={styles.text} />
      </div>
    </div>
  )
}

export default { View, Placeholder }
