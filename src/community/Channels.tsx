import {
  faPlus,
  faUsersCog,
  faHashtag,
  faCopy,
  faPencilAlt,
  faTrashAlt
} from '@fortawesome/pro-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CommunityResponse } from './Community'
import React, { useState } from 'react'
import styles from './Channels.module.scss'
import Skeleton from 'react-loading-skeleton'
import { NewChannel } from './NewChannel'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import { Clipboard } from '@capacitor/core'
import { Auth } from '../authentication/state'

export const Channels = ({ community }: { community?: CommunityResponse }) => {
  const [showCreate, setShowCreate] = useState(false)
  const history = useHistory()
  const matchChannel = useRouteMatch<{ id: string; channelID: string }>(
    '/communities/:id/:channelID'
  )
  const auth = Auth.useContainer()
  return (
    <div className={styles.community}>
      {showCreate && (
        <NewChannel
          community={community}
          onDismiss={() => setShowCreate(false)}
        />
      )}
      <div className={styles.channels}>
        <h3>{community?.name ? community.name : <Skeleton />}</h3>
        {community?.owner_id === auth.id && (
          <div className={styles.menu}>
            <div
              key='settings'
              className={
                matchChannel?.params.channelID === 'settings'
                  ? `${styles.channel} ${styles.selected}`
                  : styles.channel
              }
              onClick={() => {
                if (community)
                  history.push(`/communities/${community.id}/settings`)
              }}
            >
              <FontAwesomeIcon icon={faUsersCog} fixedWidth={true} />
              <h4>Settings</h4>
            </div>
          </div>
        )}
        <h4>
          Rooms
          <span>
            <FontAwesomeIcon
              icon={faPlus}
              onClick={() => setShowCreate(true)}
            />
          </span>
        </h4>
        <div>
          {community && community.channels.length > 0 ? (
            community.channels.map((channel) => (
              <>
                <ContextMenuTrigger
                  key={channel.id}
                  id={`channel-${channel.id}`}
                >
                  <div
                    key={channel.id}
                    className={
                      matchChannel?.params.channelID === channel.id
                        ? `${styles.channel} ${styles.selected}`
                        : styles.channel
                    }
                    onClick={() => {
                      history.push(`/communities/${community.id}/${channel.id}`)
                    }}
                  >
                    <FontAwesomeIcon icon={faHashtag} fixedWidth={true} />
                    <h4>{channel.name}</h4>
                  </div>
                </ContextMenuTrigger>
                <ContextMenu
                  key={`context-${channel.id}`}
                  id={`channel-${channel.id}`}
                  className={styles.menu}
                >
                  <MenuItem key={`edit-${channel.id}`}>
                    Edit Channel{' '}
                    <FontAwesomeIcon
                      style={{ float: 'right' }}
                      fixedWidth={true}
                      icon={faPencilAlt}
                    />
                  </MenuItem>
                  <MenuItem
                    key={`copy-${channel.id}`}
                    onClick={() => {
                      Clipboard.write({
                        string: channel.id
                      })
                    }}
                  >
                    Copy ID{' '}
                    <FontAwesomeIcon
                      style={{ float: 'right' }}
                      fixedWidth={true}
                      icon={faCopy}
                    />
                  </MenuItem>
                  <MenuItem
                    key={`div-${channel.id}`}
                    divider
                    className={styles.divider}
                  />
                  <MenuItem
                    key={`delete-${channel.id}`}
                    className={styles.danger}
                  >
                    Delete Channel{' '}
                    <FontAwesomeIcon
                      style={{ float: 'right' }}
                      fixedWidth={true}
                      icon={faTrashAlt}
                    />
                  </MenuItem>
                </ContextMenu>
              </>
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  )
}
