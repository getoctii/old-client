import {
  faPlus,
  faUsersCog,
  faHashtag,
  faAddressBook
} from '@fortawesome/pro-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CommunityResponse } from './Community'
import React, { useState } from 'react'
import styles from './Channels.module.scss'
import Skeleton from 'react-loading-skeleton'
import { NewChannel } from './NewChannel'
import { useHistory } from 'react-router-dom'

export const Channels = ({ community }: { community?: CommunityResponse }) => {
  const [showCreate, setShowCreate] = useState(false)
  const history = useHistory()
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
        <div className={styles.menu}>
          <div key='innpages' className={styles.channel}>
            <FontAwesomeIcon icon={faAddressBook} fixedWidth={true} />
            <h4>innpages</h4>
          </div>
          <div key='settings' className={styles.channel}>
            <FontAwesomeIcon icon={faUsersCog} fixedWidth={true} />
            <h4>Settings</h4>
          </div>
        </div>
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
              <div
                key={channel.id}
                className={styles.channel}
                onClick={() => {
                  history.push(`/communities/${community.id}/${channel.id}`)
                }}
              >
                <FontAwesomeIcon icon={faHashtag} fixedWidth={true} />
                <h4>{channel.name}</h4>
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
