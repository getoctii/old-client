import {
  faPlus,
  faUsersCog,
  faHashtag,
  faCopy,
  faPencilAlt,
  faTrashAlt,
  faEllipsisH,
  faDoorClosed,
  faSendBack
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
import { useMutation } from 'react-query'
import { clientGateway } from '../constants'
import { Confirmation } from '../components/Confirmation'

export const Channels = ({ community }: { community?: CommunityResponse }) => {
  const [showCreate, setShowCreate] = useState(false)
  const [showDelete, setShowDelete] = useState<string | undefined>(undefined)
  const history = useHistory()
  const matchChannel = useRouteMatch<{ id: string; channelID: string }>(
    '/communities/:id/:channelID'
  )
  const auth = Auth.useContainer()
  const [deleteChannel] = useMutation(
    async (channelID: string) =>
      (
        await clientGateway.delete(`/channels/${channelID}`, {
          headers: { Authorization: auth.token }
        })
      ).data
  )
  return (
    <div className={styles.community}>
      {}
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
      <div className={styles.channels}>
        <h3>
          {community?.name ? community.name : <Skeleton />}{' '}
          <span>
            <ContextMenuTrigger
              key={'contextMenuTrigger'}
              id={'contextMenu'}
              holdToDisplay={0}
            >
              <FontAwesomeIcon icon={faEllipsisH} />
            </ContextMenuTrigger>
          </span>
        </h3>
        <ContextMenu
          key={'contextMenu'}
          id={`contextMenu`}
          className={styles.contextMenu}
        >
          <MenuItem>
            Create Invite
            <FontAwesomeIcon
              style={{ float: 'right' }}
              fixedWidth={true}
              icon={faSendBack}
            />
          </MenuItem>
          <MenuItem>
            Leave Server
            <FontAwesomeIcon
              style={{ float: 'right' }}
              fixedWidth={true}
              icon={faDoorClosed}
            />
          </MenuItem>
        </ContextMenu>
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
              <h4>
                <FontAwesomeIcon icon={faUsersCog} fixedWidth={true} />
                Settings
              </h4>
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
        <div className={styles.contextWrapper}>
          {community && community.channels.length > 0 ? (
            community.channels.map((channel) => (
              <div key={channel.id} className={styles.channelWrapper}>
                <ContextMenuTrigger
                  key={channel.id}
                  id={`channel-${channel.id}`}
                >
                  <div
                    className={
                      matchChannel?.params.channelID === channel.id
                        ? `${styles.channel} ${styles.selected}`
                        : styles.channel
                    }
                    onClick={() => {
                      history.push(`/communities/${community.id}/${channel.id}`)
                    }}
                  >
                    <h4>
                      <FontAwesomeIcon icon={faHashtag} fixedWidth={true} />
                      {channel.name}
                    </h4>
                  </div>
                </ContextMenuTrigger>
                <ContextMenu
                  key={`context-${channel.id}`}
                  id={`channel-${channel.id}`}
                  className={styles.contextMenu}
                >
                  {community.owner_id === auth.id && (
                    <MenuItem key={`edit-${channel.id}`}>
                      Edit Channel{' '}
                      <FontAwesomeIcon
                        style={{ float: 'right' }}
                        fixedWidth={true}
                        icon={faPencilAlt}
                      />
                    </MenuItem>
                  )}
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
    </div>
  )
}
