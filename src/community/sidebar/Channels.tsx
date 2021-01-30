import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import styles from './Channels.module.scss'
import { ModalTypes, Permissions } from '../../utils/constants'
import { ChannelCard } from './ChannelCard'
import { UI } from '../../state/ui'
import { Permission } from '../../utils/permissions'

const ChannelsView = () => {
  const ui = UI.useContainer()

  const { community, hasPermissions } = Permission.useContainer()

  return (
    <div className={styles.channels}>
      <h4>
        Rooms
        {hasPermissions([Permissions.MANAGE_CHANNELS]) && (
          <span>
            <FontAwesomeIcon
              className={styles.add}
              icon={faPlus}
              onClick={() => ui.setModal({ name: ModalTypes.NEW_CHANNEL })}
            />
          </span>
        )}
      </h4>
      <div className={styles.list}>
        {community && community.channels.length > 0 ? (
          community.channels.map((channel, index) => (
            <ChannelCard key={channel} channelID={channel} index={index} />
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

const ChannelsPlaceholder = () => {
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

const Channels = { View: ChannelsView, Placeholder: ChannelsPlaceholder }

export default Channels
