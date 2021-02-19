import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useMemo } from 'react'
import styles from './Channels.module.scss'
import {
  ChannelTypes,
  clientGateway,
  ModalTypes,
  Permissions
} from '../../utils/constants'
import ChannelCard from './ChannelCard'
import { UI } from '../../state/ui'
import { Permission } from '../../utils/permissions'
import { queryCache, useQuery } from 'react-query'
import { Auth } from '../../authentication/state'
import { ChannelResponse, getChannels } from '../remote'
import { useRouteMatch } from 'react-router-dom'
import { DragDropContext, DropResult } from '@react-forked/dnd'
import CategoryCard from './channel/CategoryCard'

const reorder = (
  list: ChannelResponse[],
  startIndex: number,
  endIndex: number
): ChannelResponse[] => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

type Categories = {
  [key in string]: {
    type: ChannelTypes
    children: ChannelResponse[]
  }
}

const groupByCategories = (channels: ChannelResponse[]) => {
  const items: Categories = {}
  const categories = channels.filter(
    (channel) => channel.type === ChannelTypes.CATEGORY || !channel.parent_id
  )
  console.log(categories)

  categories.forEach((category) => {
    if (category.type !== ChannelTypes.CATEGORY) {
      items['rooms'] = {
        type: ChannelTypes.CATEGORY,
        children: [...(items['rooms']?.children ?? []), category]
      }
      return
    }
    const categoryChildren = channels.filter(
      (channel) => channel.parent_id === category.id
    )
    items[category.id] = {
      type: category.type,
      children: categoryChildren
    }
  })

  return items
}

const ChannelsView = () => {
  const ui = UI.useContainer()
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const { data: channels } = useQuery(
    ['channels', match?.params.id, auth.token],
    getChannels
  )

  const constructCursedTree = useMemo(() => {
    return groupByCategories(channels ?? [])
  }, [channels])
  console.log(constructCursedTree)

  const { hasPermissions } = Permission.useContainer()

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      if (
        !result.destination ||
        result.destination.index === result.source.index
      )
        return
      const channel = channels?.find((c) => c.id === result.draggableId)
      if (!channel) return
      console.log(result.destination.index)
      const channelBefore =
        result.destination.index > 0
          ? channels?.[result.destination.index - 1]
          : undefined
      console.log(channel)
      console.log(channelBefore)
      const reorderedChannels = reorder(
        channels ?? [],
        result.source.index,
        result.destination.index
      )
      if (channel.type !== ChannelTypes.CATEGORY && channelBefore) {
        const parentID =
          channelBefore.type === ChannelTypes.CATEGORY
            ? channelBefore.id
            : channelBefore.parent_id
            ? channelBefore.parent_id
            : undefined
        if (
          (parentID && !channel.parent_id) ||
          channel.parent_id !== parentID
        ) {
          await clientGateway.patch(
            `/channels/${channel.id}`,
            {
              parent: channelBefore.id,
              parent_order: reorderedChannels
                .filter((c) => c.parent_id === parentID || c.id === channel.id)
                .map((c) => c.id)
            },
            {
              headers: {
                Authorization: auth.token
              }
            }
          )
          return
        } else if (parentID && channel.parent_id) {
          await clientGateway.post(
            `/channels/${channel.id}/reorder`,
            {
              order: reorderedChannels
                .filter(
                  (c) =>
                    c.parent_id === channelBefore.parent_id ||
                    c.id === channel.id
                )
                .map((channel) => channel.id)
            },
            {
              headers: {
                Authorization: auth.token
              }
            }
          )
          return
        }
      } else if (channel.type !== ChannelTypes.CATEGORY && !channelBefore) {
      }

      queryCache.setQueryData<ChannelResponse[]>(
        ['channels', match?.params.id, auth.token],
        reorderedChannels
      )

      await clientGateway.patch(
        `/communities/${match?.params.id}/channels`,
        {
          order: reorderedChannels.map((channel) => channel.id)
        },
        {
          headers: {
            Authorization: auth.token
          }
        }
      )
    },
    [auth.token, channels, match?.params.id]
  )

  /*
  const DroppableComponent = useCallback(
    (provided: DroppableProvided) => (
      <div
        className={styles.body}
        {...provided.droppableProps}
        ref={provided.innerRef}
      >
        <h1></h1>
        {Object.keys(constructCursedTree)?.map(
          (channelID, index) =>
            channelID && (
              <div key={channelID}>
                <ChannelCard.Draggable
                  key={channelID}
                  id={channelID}
                  index={index}
                  type={constructCursedTree[channelID].type}
                  children={
                    constructCursedTree[channelID].type ===
                      ChannelTypes.CATEGORY &&
                    constructCursedTree[
                      channelID
                    ].children.map((cha, index) => (
                      <ChannelCard.View
                        key={cha.id}
                        id={cha.id}
                        index={index}
                      />
                    ))
                  }
                />
              </div>
            )
        )}
        {provided.placeholder}
      </div>
    ),
    [constructCursedTree]
  )
*/

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
        {(Object.keys(constructCursedTree)?.length ?? 0) > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            {constructCursedTree['rooms'] &&
              constructCursedTree['rooms'].children.length > 0 && (
                <CategoryCard
                  id={'rooms'}
                  items={constructCursedTree['rooms'].children.map((c) => c.id)}
                />
              )}

            {Object.keys(constructCursedTree)
              .filter((c) => c !== 'rooms')
              .map((key) => (
                <CategoryCard
                  id={key}
                  name={channels?.find((c) => c.id === key)?.name ?? ''}
                  items={constructCursedTree[key].children.map((c) => c.id)}
                />
              ))}
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
