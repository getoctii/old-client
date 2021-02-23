import React, { useCallback, useMemo } from 'react'
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

const reorder = (
  list: ChannelResponse[],
  startIndex: number,
  endIndex: number
): ChannelResponse[] => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  console.log(result)
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

const ChannelsView = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const { data: channels } = useQuery(
    ['channels', match?.params.id, auth.token],
    getChannels
  )
  const ui = UI.useContainer()
  const { hasPermissions } = Permission.useContainer()

  const constructCursedTree = useMemo(() => {
    return groupByCategories(channels ?? [])
  }, [channels])
  const onDragEnd = useCallback(
    async (result: Dropper) => {
      if (!result.destination) return
      if (result.type === 'parents') {
        const children = (channels ?? []).filter((c) => !!c.parent_id)
        const unassignedChildren = (channels ?? []).filter(
          (c) => !c.parent_id && c.type !== ChannelTypes.CATEGORY
        )
        const reorderedChannels = reorder(
          channels?.filter(
            (c) => !c.parent_id && c.type === ChannelTypes.CATEGORY
          ) ?? [],
          result.source.index,
          result.destination.index
        ).map((c, index) => ({ ...c, order: index + 1 }))

        queryCache.setQueryData<ChannelResponse[]>(
          ['channels', match?.params.id, auth.token],
          [...unassignedChildren, ...reorderedChannels, ...children]
        )

        await clientGateway.patch(
          `/communities/${match?.params.id}/channels`,
          {
            order: [...unassignedChildren, ...reorderedChannels].map(
              (channel) => channel.id
            )
          },
          {
            headers: {
              Authorization: auth.token
            }
          }
        )
        return
      } else if (result.type === 'children') {
        // Case #1: Children Reordered inside same parent
        if (result.source.droppableId === result.destination.droppableId) {
          if (result.source.droppableId === 'unassigned') {
            const parents = (channels ?? []).filter(
              (c) => c.type === ChannelTypes.CATEGORY
            )
            const parentsAndChildren = (channels ?? []).filter(
              (c) => !!c.parent_id || c.type === ChannelTypes.CATEGORY
            )
            const destinationChildren = (channels ?? []).filter(
              (c) => !c.parent_id && c.type !== ChannelTypes.CATEGORY
            )
            const reorderedChildren = reorder(
              destinationChildren,
              result.source.index,
              result.destination.index
            ).map((c, index) => ({ ...c, order: index + 1 }))

            queryCache.setQueryData<ChannelResponse[]>(
              ['channels', match?.params.id, auth.token],
              [...reorderedChildren, ...parentsAndChildren]
            )

            await clientGateway.patch(
              `/communities/${match?.params.id}/channels`,
              {
                order: [
                  ...reorderedChildren.map((c) => c.id),
                  ...parents.map((c) => c.id)
                ]
              },
              {
                headers: {
                  Authorization: auth.token
                }
              }
            )
            return
          }
          const parents = (channels ?? []).filter(
            (c) => c.parent_id !== result.source.droppableId
          )
          const parentChildren = (channels ?? []).filter(
            (c) => c.parent_id === result.source.droppableId
          )
          const reorderedChildren = reorder(
            parentChildren,
            result.source.index,
            result.destination.index
          ).map((c, index) => ({ ...c, order: index + 1 }))

          queryCache.setQueryData<ChannelResponse[]>(
            ['channels', match?.params.id, auth.token],
            [...parents, ...reorderedChildren]
          )

          await clientGateway.post(
            `/channels/${result.source.droppableId}/reorder`,
            {
              order: reorderedChildren.map((c) => c.id)
            },
            {
              headers: {
                Authorization: auth.token
              }
            }
          )
          return
        } else if (
          result.destination.droppableId !== result.source.droppableId
        ) {
          // Case #2: Child unassigned
          if (result.destination.droppableId === 'unassigned') {
            const parents = (channels ?? []).filter(
              (c) => c.type === ChannelTypes.CATEGORY
            )
            const otherChannels = (channels ?? []).filter(
              (c) => !!c.parent_id && c.parent_id !== result.source.droppableId
            )
            const destinationChildren = (channels ?? []).filter(
              (c) => !c.parent_id && c.type !== ChannelTypes.CATEGORY
            )
            const sourceChildren = (channels ?? []).filter(
              (c) => c.parent_id === result.source.droppableId
            )
            const [draggedItem] = sourceChildren.splice(result.source.index, 1)
            destinationChildren.splice(result.destination.index, 0, draggedItem)

            const orderedSourceChildren = sourceChildren.map((c, index) => ({
              ...c,
              order: index + 1
            }))

            const orderedDestinationChildren = [
              ...destinationChildren,
              ...parents
            ].map((c, index) => ({
              ...c,
              order: index + 1,
              parent_id: undefined
            }))

            queryCache.setQueryData<ChannelResponse[]>(
              ['channels', match?.params.id, auth.token],
              [
                ...orderedDestinationChildren,
                ...otherChannels,
                ...orderedSourceChildren
              ]
            )

            await clientGateway.patch(
              `/channels/${draggedItem.id}`,
              {
                parent: null,
                parent_order: orderedDestinationChildren.map((c) => c.id)
              },
              {
                headers: {
                  Authorization: auth.token
                }
              }
            )

            return
          } else if (result.source.droppableId === 'unassigned') {
            const parents = (channels ?? []).filter(
              (c) => c.type === ChannelTypes.CATEGORY
            )
            const otherChildren = (channels ?? []).filter(
              (c) =>
                !!c.parent_id &&
                c.parent_id !== result.destination?.droppableId &&
                c.type !== ChannelTypes.CATEGORY
            )
            const destinationChildren = (channels ?? []).filter(
              (c) => result.destination?.droppableId === c.parent_id
            )
            const sourceChildren = (channels ?? []).filter((c) => !c.parent_id)
            const [draggedItem] = sourceChildren.splice(result.source.index, 1)
            destinationChildren.splice(result.destination.index, 0, draggedItem)

            const orderedSourceChildren = [...sourceChildren, ...parents].map(
              (c, index) => ({
                ...c,
                order: index + 1
              })
            )

            const orderedDestinationChildren = destinationChildren.map(
              (c, index) => ({
                ...c,
                order: index + 1,
                parent_id: result.destination?.droppableId
              })
            )

            queryCache.setQueryData<ChannelResponse[]>(
              ['channels', match?.params.id, auth.token],
              [
                ...orderedDestinationChildren,
                ...orderedSourceChildren,
                ...otherChildren
              ]
            )

            await clientGateway.patch(
              `/channels/${draggedItem.id}`,
              {
                parent: result.destination.droppableId,
                parent_order: orderedDestinationChildren.map((c) => c.id)
              },
              {
                headers: {
                  Authorization: auth.token
                }
              }
            )

            return
          }
          // Case #3: Child reassigned
          const parents = (channels ?? []).filter(
            (c) =>
              c.parent_id !== result.source.droppableId &&
              c.parent_id !== result.destination?.droppableId
          )
          const destinationChildren = (channels ?? []).filter(
            (c) => c.parent_id === result.destination?.droppableId
          )
          const sourceChildren = (channels ?? []).filter(
            (c) => c.parent_id === result.source.droppableId
          )
          const [draggedItem] = sourceChildren.splice(result.source.index, 1)
          destinationChildren.splice(result.destination.index, 0, draggedItem)

          const orderedSourceChildren = sourceChildren.map((c, index) => ({
            ...c,
            order: index + 1
          }))

          const orderedDestinationChildren = destinationChildren.map(
            (c, index) => ({
              ...c,
              order: index + 1,
              parent_id: result.destination?.droppableId
            })
          )

          queryCache.setQueryData<ChannelResponse[]>(
            ['channels', match?.params.id, auth.token],
            [
              ...parents,
              ...orderedDestinationChildren,
              ...orderedSourceChildren
            ]
          )

          await clientGateway.patch(
            `/channels/${draggedItem.id}`,
            {
              parent: result.destination.droppableId,
              parent_order: orderedDestinationChildren.map((c) => c?.id)
            },
            {
              headers: {
                Authorization: auth.token
              }
            }
          )

          return
        }
      }
    },
    [auth.token, channels, match?.params.id]
  )

  const DroppableComponent = useCallback(
    (provided: DroppableProvided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {Object.keys(constructCursedTree)
          .filter((c) => c !== 'unassigned')
          .map((key, index) => (
            <CategoryCardView
              key={key}
              id={key}
              index={index}
              name={channels?.find((c) => c.id === key)?.name ?? ''}
              items={constructCursedTree[key].children.map((c) => c.id)}
            />
          ))}
        {provided.placeholder}
      </div>
    ),
    [channels, constructCursedTree]
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
        {(Object.keys(constructCursedTree)?.length ?? 0) > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <CategoryChannelsDraggable
              key={'unassigned'}
              id={'unassigned'}
              items={
                constructCursedTree['unassigned']?.children?.map((c) => c.id) ??
                []
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
