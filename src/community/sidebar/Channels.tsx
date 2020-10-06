import {
  faPlus,
  faHashtag,
  faPencilAlt,
  faCopy,
  faTrashAlt,
  faBellSlash,
  faBell
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { ContextMenuTrigger, ContextMenu, MenuItem } from 'react-contextmenu'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import { CommunityResponse } from '../remote'
import styles from './Channels.module.scss'
import { Clipboard } from '@capacitor/core'
import { AnimatePresence, motion } from 'framer-motion'
import { NewChannel } from '../NewChannel'
import { Confirmation } from '../../components/Confirmation'
import { useMutation } from 'react-query'
import { clientGateway } from '../../constants'
import { useLocalStorage } from 'react-use'

export const Channels = ({ community }: { community?: CommunityResponse }) => {
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
  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {showCreate && (
          <NewChannel
            community={community}
            onDismiss={() => setShowCreate(false)}
          />
        )}
        {showDelete && (
          <Confirmation
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
              icon={faPlus}
              onClick={() => setShowCreate(true)}
            />
          </span>
        )}
      </h4>
      <div className={styles.channels}>
        {community && community.channels.length > 0 ? (
          community.channels.map((channel) => (
            <div key={channel.id} className={styles.channelWrapper}>
              <ContextMenuTrigger key={channel.id} id={`channel-${channel.id}`}>
                <motion.div
                  animate={
                    match?.params.channelID === channel.id
                      ? {
                          background: 'var(--neko-primary)', // it was missing ) h
                          color: 'var(--neko-text-inline)'
                        }
                      : {
                          background: 'var(--neko-background)',
                          color: 'var(--neko-text)'
                        }
                  }
                  transition={{
                    duration: 0.25
                  }}
                  className={styles.channel}
                  onClick={() => {
                    history.push(
                      `/communities/${community.id}/channels/${channel.id}`
                    )
                  }}
                >
                  <h4>
                    <FontAwesomeIcon icon={faHashtag} fixedWidth={true} />
                    {channel.name}
                    {mutedChannels?.includes(channel.id) && (
                      <FontAwesomeIcon
                        className={styles.muted}
                        icon={faBellSlash}
                        fixedWidth
                      />
                    )}
                  </h4>
                </motion.div>
              </ContextMenuTrigger>
              <ContextMenu
                key={`context-${channel.id}`}
                id={`channel-${channel.id}`}
                className={styles.contextMenu}
              >
                <MenuItem
                  key={`mute-${channel.id}`}
                  onClick={() => {
                    if (!channel.id) return
                    if (mutedChannels?.includes(channel.id))
                      setMutedChannels(
                        mutedChannels.filter(
                          (channels) => channels !== channel.id
                        )
                      )
                    else
                      setMutedChannels([...(mutedChannels || []), channel.id])
                  }}
                >
                  {mutedChannels?.includes(channel.id) ? (
                    <>
                      Unmute Channel{' '}
                      <FontAwesomeIcon
                        icon={faBellSlash}
                        fixedWidth={true}
                        style={{ float: 'right' }}
                      />
                    </>
                  ) : (
                    <>
                      Mute Channel{' '}
                      <FontAwesomeIcon
                        icon={faBell}
                        fixedWidth={true}
                        style={{ float: 'right' }}
                      />
                    </>
                  )}
                </MenuItem>
                <MenuItem
                  key={`copy-${channel.id}`}
                  onClick={() => {
                    Clipboard.write({
                      string: channel.id
                    })
                  }}
                >
                  Copy ID
                  <FontAwesomeIcon
                    style={{ float: 'right' }}
                    fixedWidth={true}
                    icon={faCopy}
                  />
                </MenuItem>
                {community.owner_id === auth.id && (
                  <MenuItem
                    key={`delete-${channel.id}`}
                    className={styles.danger}
                    onClick={() => setShowDelete(channel.id)}
                  >
                    Delete Channel
                    <FontAwesomeIcon
                      style={{ float: 'right' }}
                      fixedWidth={true}
                      icon={faTrashAlt}
                    />
                  </MenuItem>
                )}
              </ContextMenu>
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
