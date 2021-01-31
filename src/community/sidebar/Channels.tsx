import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Suspense, useMemo } from 'react'
import styles from './Channels.module.scss'
import { ModalTypes, Permissions } from '../../utils/constants'
import ChannelCard from './ChannelCard'
import { UI } from '../../state/ui'
import { Permission } from '../../utils/permissions'
const ChannelsView = () => {
  const ui = UI.useContainer()

  const { community, hasPermissions } = Permission.useContainer()

  return (
    <div className={styles.channels}>
      <h4 className={styles.rooms}>
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
            <div key={channel}>
              <Suspense fallback={<ChannelCard.Placeholder index={index} />}>
                <ChannelCard.View channelID={channel} index={index} />
              </Suspense>
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

const ChannelsPlaceholder = () => {
  const length = useMemo(() => Math.floor(Math.random() * 10) + 1, [])
  return (
    <div className={styles.channelsPlaceholder}>
      {Array.from(Array(length).keys()).map((_, index) => (
        <ChannelCard.Placeholder key={index} index={index} />
      ))}
    </div>
  )
}

const Channels = { View: ChannelsView, Placeholder: ChannelsPlaceholder }

export default Channels
