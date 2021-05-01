import { useCallback, useMemo, FC } from 'react'
import styles from './Channels.module.scss'
import {
  ChannelTypes,
  clientGateway,
  ModalTypes,
  Permissions
} from '../../utils/constants'
import ChannelCard from './channel/ChannelCard'
import { queryCache, useQuery } from 'react-query'
import { Auth } from '../../authentication/state'
import { ChannelResponse, getChannels } from '../remote'
import { useRouteMatch } from 'react-router-dom'
import {
  DragDropContext,
  Droppable,
  DroppableProvided,
  DropResult
} from '@react-forked/dnd'
import {
  CategoryCardView,
  CategoryChannelsDraggable
} from './channel/CategoryCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { Permission } from '../../utils/permissions'
import { UI } from '../../state/ui'

const insert = (
  list: ChannelResponse[],
  index: number,
  item: ChannelResponse
) => {
  const result = Array.from(list)
  result.splice(index, 0, item)
  return result
}

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
  const categories = channels
    .filter(
      (channel) =>
        channel?.type === ChannelTypes.CATEGORY || !channel?.parent_id
    )
    .sort((a, b) => a.order - b.order)
  categories.forEach((category) => {
    if (category.type !== ChannelTypes.CATEGORY) {
      items['unassigned'] = {
        type: ChannelTypes.CATEGORY,
        children: [...(items['unassigned']?.children ?? []), category]
      }
      return
    }
    const categoryChildren = channels
      .filter((channel) => channel?.parent_id === category.id)
      .sort((a, b) => a.order - b.order)
    items[category.id] = {
      type: category.type,
      children: categoryChildren
    }
  })

  return items
}

interface Dropper extends DropResult {
  type: string
}

const ChannelsView: FC = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const { data: channels } = useQuery(
    ['channels', match?.params.id, auth.token],
    getChannels
  )
  const ui = UI.useContainer()
  const { hasPermissions } = Permission.useContainer()

  const groupedChannels = useMemo(() => {
    return groupByCategories(channels ?? [])
  }, [channels])
  const onDragEnd = useCallback(
    async (result: Dropper) => {
      if (!result.destination) return
      const channel = channels?.find((c) => c.id === result.draggableId)
      if (!channel) return
      if (result.type === 'children') {
        const parentChildren = groupedChannels[result.destination.droppableId]
        const destinationParentID =
          result.destination?.droppableId === 'unassigned'
            ? undefined
            : result.destination?.droppableId
        const previousChannel =
          result.destination.index === 0
            ? undefined
            : parentChildren?.children?.[result.destination.index - 1] ??
              undefined
        const brothers =
          channels?.filter(
            (c) =>
              (!destinationParentID &&
                c.type === ChannelTypes.TEXT &&
                !c.parent_id &&
                c.id !== channel.id) ||
              c.parent_id === destinationParentID
          ) ?? []
        const newBrothers =
          channel.parent_id !== destinationParentID
            ? insert(brothers, result.destination.index, channel)
            : reorder(
                brothers,
                result.source.index,
                result.destination?.index ?? 0
              )
        const otherChannels =
          channels?.filter(
            (c) =>
              c.type === ChannelTypes.CATEGORY ||
              (c.parent_id !== destinationParentID && c.id !== channel.id)
          ) ?? []
        queryCache.setQueryData<ChannelResponse[]>(
          ['channels', match?.params.id, auth.token],
          [
            ...otherChannels,
            ...newBrothers.map((c, index) => ({
              ...c,
              parent_id:
                result.destination?.droppableId === 'unassigned'
                  ? undefined
                  : result.destination?.droppableId,
              order: index + 1
            }))
          ]
        )
        await clientGateway.patch(
          `/channels/${channel.id}`,
          {
            parent: destinationParentID ?? null,
            previous_channel_id: previousChannel?.id ?? null
          },
          {
            headers: {
              Authorization: auth.token
            }
          }
        )
      } else {
        const parents = channels?.filter(
          (c) => c.type === ChannelTypes.CATEGORY
        )
        if (!parents) return
        const previousChannel =
          parents[
            result.destination.index === 0
              ? result.destination.index - 1
              : result.destination.index
          ]

        const newParents = reorder(
          parents,
          result.source.index,
          result.destination?.index ?? 0
        )

        const nonParents =
          channels?.filter((c) => c.type !== ChannelTypes.CATEGORY) ?? []
        queryCache.setQueryData<ChannelResponse[]>(
          ['channels', match?.params.id, auth.token],
          [
            ...nonParents,
            ...newParents.map((c, index) => ({
              ...c,
              order: index + 1
            }))
          ]
        )
        await clientGateway.patch(
          `/channels/${channel.id}`,
          {
            parent: null,
            previous_channel_id: previousChannel?.id ?? null
          },
          {
            headers: {
              Authorization: auth.token
            }
          }
        )
      }
    },
    [auth.token, channels, match?.params.id, groupedChannels]
  )

  const DroppableComponent = useCallback(
    (provided: DroppableProvided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {Object.keys(groupedChannels)
          .filter((c) => c !== 'unassigned')
          .map((key, index) => (
            <CategoryCardView
              key={key}
              id={key}
              index={index}
              name={channels?.find((c) => c.id === key)?.name ?? ''}
              items={groupedChannels[key].children.map((c) => c.id)}
            />
          ))}
        {provided.placeholder}
      </div>
    ),
    [channels, groupedChannels]
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
        {(Object.keys(groupedChannels)?.length ?? 0) > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <CategoryChannelsDraggable
              key={'unassigned'}
              id={'unassigned'}
              items={
                groupedChannels['unassigned']?.children?.map((c) => c.id) ?? []
              }
            />
            <Droppable droppableId={'channels'} type={'parents'}>
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

const ChannelsPlaceholder: FC = () => {
  const length = useMemo(() => Math.floor(Math.random() * 10) + 1, [])
  return (
    <div className={styles.channelsPlaceholder}>
      <div className={styles.rooms} />
      {Array.from(Array(length).keys()).map((_, index) => (
        <ChannelCard.Placeholder key={index} index={index} />
      ))}
    </div>
  )
}

const Channels = { View: ChannelsView, Placeholder: ChannelsPlaceholder }

export default Channels
