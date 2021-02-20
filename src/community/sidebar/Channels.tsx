import React, { useCallback, useMemo } from 'react'
import styles from './Channels.module.scss'
import { ChannelTypes, clientGateway } from '../../utils/constants'
import ChannelCard from './ChannelCard'
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
  console.log(categories)

  categories.forEach((category) => {
    if (category.type !== ChannelTypes.CATEGORY) {
      items['rooms'] = {
        type: ChannelTypes.CATEGORY,
        children: [...(items['rooms']?.children ?? []), category]
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

const ChannelsView = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const { data: channels } = useQuery(
    ['channels', match?.params.id, auth.token],
    getChannels
  )

  const constructCursedTree = useMemo(() => {
    return groupByCategories(channels ?? [])
  }, [channels])
  const onDragEnd = useCallback(
    async (result: DropResult) => {
      console.log(result)
      if (!result.destination) return
      const channel = channels?.find((c) => c.id === result.draggableId)
      console.log('c', channel)
      if (!channel) return

      console.log('i', result.destination.droppableId)
      const channelBefore = channels?.find(
        (c) => c.id === result.destination?.droppableId
      )

      console.log('cb', channelBefore)
      if (channel.type !== ChannelTypes.CATEGORY && channelBefore) {
        const parentID =
          channelBefore.type === ChannelTypes.CATEGORY
            ? channelBefore.id
            : channelBefore.parent_id
        console.log(parentID)
        if (parentID && channel.parent_id !== parentID) {
          console.log('Parent switched')
          const reorderedChannels = reorder(
            channels?.filter(
              (c) => c?.parent_id === parentID || c?.id === channel.id
            ) ?? [],
            result.source.index,
            result.destination.index
          )
            .filter((c) => !!c)
            .map((c, index) => ({
              ...c,
              order: index + 1,
              parent_id: parentID
            }))
          console.log(reorderedChannels)
          queryCache.setQueryData<ChannelResponse[]>(
            ['channels', match?.params.id, auth.token],
            [
              ...(channels?.filter(
                (c) => c.parent_id !== parentID && c.id !== channel.id
              ) ?? []),
              ...reorderedChannels
            ]
          )
          await clientGateway.patch(
            `/channels/${channel.id}`,
            {
              parent: parentID,
              parent_order: reorderedChannels
                .filter(
                  (c) => c?.parent_id === parentID || c?.id === channel.id
                )
                .map((c) => c?.id)
            },
            {
              headers: {
                Authorization: auth.token
              }
            }
          )

          return
        } else if (parentID && channel.parent_id === parentID) {
          console.log('Parent reordered')
          const reorderedChannels = reorder(
            channels?.filter(
              (c) => c.parent_id === channel.parent_id || c.id === channel.id
            ) ?? [],
            result.source.index,
            result.destination.index
          ).map((c, index) => ({ ...c, order: index + 1, parent_id: parentID }))
          console.log(reorderedChannels)
          queryCache.setQueryData<ChannelResponse[]>(
            ['channels', match?.params.id, auth.token],
            [
              ...(channels?.filter((c) => c.parent_id !== parentID) ?? []),
              ...reorderedChannels
            ]
          )
          await clientGateway.post(
            `/channels/${channel.parent_id}/reorder`,
            {
              order: reorderedChannels
                .filter(
                  (c) =>
                    c.parent_id === channel.parent_id || c.id === channel.id
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
      } else if (
        channel.type !== ChannelTypes.CATEGORY &&
        !channelBefore &&
        !!channel.parent_id
      ) {
        console.log('Parent unassigned')
        const reorderedChannels = reorder(
          channels?.filter((c) => !c.parent_id || c.id === channel.id) ?? [],
          result.source.index,
          result.destination.index
        ).map((c, index) => ({ ...c, order: index + 1, parent_id: undefined }))
        console.log(reorderedChannels)
        queryCache.setQueryData<ChannelResponse[]>(
          ['channels', match?.params.id, auth.token],
          [
            ...(channels?.filter((c) => !!c.parent_id && c.id !== channel.id) ??
              []),
            ...reorderedChannels
          ]
        )
        await clientGateway.patch(
          `/channels/${channel.id}`,
          {
            parent: null,
            parent_order: reorderedChannels.map((c) => c.id)
          },
          {
            headers: {
              Authorization: auth.token
            }
          }
        )
        return
      }
      console.log('General reorder')
      const reorderedChannels = reorder(
        channels?.filter((c) => !c.parent_id) ?? [],
        result.source.index,
        result.destination.index
      )

      await queryCache.invalidateQueries([
        'channels',
        match?.params.id,
        auth.token
      ])

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

  return (
    <div className={styles.channels}>
      <div className={styles.list}>
        {(Object.keys(constructCursedTree)?.length ?? 0) > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <CategoryCard
              key={'rooms'}
              id={'rooms'}
              name={'Rooms'}
              items={
                constructCursedTree['rooms']?.children?.map((c) => c.id) ?? []
              }
            />
            {Object.keys(constructCursedTree)
              .filter((c) => c !== 'rooms')
              .map((key) => (
                <CategoryCard
                  key={key}
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
