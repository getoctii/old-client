import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import styles from './Channels.module.scss'
import { clientGateway, ModalTypes, Permissions } from '../../utils/constants'
import ChannelCard from './ChannelCard'
import { UI } from '../../state/ui'
import { Permission } from '../../utils/permissions'
import { queryCache } from 'react-query'
import { Auth } from '../../authentication/state'
import { CommunityResponse } from '../remote'
import { DragDropContext, Droppable } from '@react-forked/dnd'

const reorder = (
  list: string[],
  startIndex: number,
  endIndex: number
): string[] => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

const ChannelsView = () => {
  const ui = UI.useContainer()
  const auth = Auth.useContainer()
  const { community, hasPermissions } = Permission.useContainer()

  const onDragEnd = useCallback(
    async (result) => {
      if (
        !result.destination ||
        result.destination.index === result.source.index
      )
        return
      const reorderedChannels = reorder(
        community?.channels ?? [],
        result.source.index,
        result.destination.index
      )
      queryCache.setQueryData<CommunityResponse>(
        ['community', community?.id, auth.token],
        (initial) => {
          if (initial) {
            return {
              ...initial,
              channels: reorderedChannels
            }
          } else {
            return {
              id: community?.id ?? '',
              name: community?.name ?? '',
              icon: community?.icon ?? '',
              large: community?.large ?? false,
              channels: reorderedChannels,
              base_permissions: community?.base_permissions ?? []
            }
          }
        }
      )
      await clientGateway.patch(
        `/communities/${community?.id}/channels`,
        {
          order: reorderedChannels
        },
        {
          headers: {
            Authorization: auth.token
          }
        }
      )
    },
    [auth.token, community]
  )

  const DroppableComponent = useCallback(
    (provided) => (
      <div
        className={styles.body}
        {...provided.droppableProps}
        ref={provided.innerRef}
      >
        {community?.channels?.map(
          (channelID, index) =>
            channelID && (
              <ChannelCard.Draggable
                key={channelID}
                id={channelID}
                index={index}
              />
            )
        )}
        {provided.placeholder}
      </div>
    ),
    [community?.channels]
  )

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
        {(community?.channels?.length ?? 0) > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='groups' direction='vertical'>
              {DroppableComponent}
            </Droppable>
          </DragDropContext>
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
