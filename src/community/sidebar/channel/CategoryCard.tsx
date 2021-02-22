import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot
} from '@react-forked/dnd'
import React, { useCallback } from 'react'
import ChannelCard from './ChannelCard'
import styles from './CategoryCard.module.scss'
import { Permission } from '../../../utils/permissions'
import { Permissions } from '../../../utils/constants'

export const CategoryChannelsDraggable = ({
  id,
  items
}: {
  id: string
  items: string[]
}) => {
  const DroppableComponent = useCallback(
    (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
      <div
        className={styles.children}
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        <div>
          {items.map((channelID, index) => (
            <ChannelCard.Draggable
              key={channelID}
              id={channelID}
              index={index}
            />
          ))}
        </div>
        {provided.placeholder}
      </div>
    ),
    [items]
  )
  return (
    <Droppable droppableId={id} type='children'>
      {DroppableComponent}
    </Droppable>
  )
}

export const CategoryCardView = ({
  id,
  name,
  items,
  index
}: {
  id: string
  name: string
  items: string[]
  index: number
}) => {
  const { hasPermissions } = Permission.useContainer()
  const DraggableComponent = useCallback(
    (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
      <div>
        <div
          className={styles.category}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <h4 className={styles.name} {...provided.dragHandleProps}>
            {name}
          </h4>
          <CategoryChannelsDraggable id={id} items={items} />
        </div>
      </div>
    ),
    [id, items, name]
  )

  return (
    <Draggable
      draggableId={id}
      index={index}
      isDragDisabled={!hasPermissions([Permissions.MANAGE_CHANNELS])}
    >
      {DraggableComponent}
    </Draggable>
  )
}
