import {
  faEllipsisH,
  faSendBack,
  faDoorClosed
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Integrations } from './Integrations'
import React, { useState } from 'react'
import { ContextMenuTrigger, ContextMenu, MenuItem } from 'react-contextmenu'
import Skeleton from 'react-loading-skeleton'
import { useMutation, useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { Auth } from '../../authentication/state'
import { Confirmation } from '../../components/Confirmation'
import { clientGateway } from '../../constants'
import { NewChannel } from '../NewChannel'
import { getCommunity } from '../remote'
import styles from './Sidebar.module.scss'
import { Channels } from './Channels'

export const Sidebar = () => {
  const auth = Auth.useContainer()
  const { id } = useParams<{ id: string }>()
  const community = useQuery(['community', id, auth.token], getCommunity)

  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <h3>
          {community.data?.name ? community.data?.name : <Skeleton />}{' '}
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
        <Integrations community={community.data} />
        <Channels community={community.data} />
      </div>
    </div>
  )
}
