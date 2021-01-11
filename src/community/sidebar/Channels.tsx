import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { Auth } from '../../authentication/state'
import { Community } from '../remote'
import styles from './Channels.module.scss'
import { AnimatePresence } from 'framer-motion'
import { NewChannel } from '../NewChannel'
import { Confirmation } from '../../components/Confirmation'
import { useMutation } from 'react-query'
import { clientGateway } from '../../utils/constants'
import { ChannelCard } from './ChannelCard'

const View = ({ community }: { community?: Community }) => {
  const auth = Auth.useContainer()
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
            <ChannelCard
              key={channel}
              channelID={channel}
              index={index}
              community={community}
              setShowDelete={setShowDelete}
            />
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

const Channels = { View, Placeholder }

export default Channels
