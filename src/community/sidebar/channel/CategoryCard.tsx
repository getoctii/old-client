import { Droppable, DroppableProvided } from '@react-forked/dnd'
import React, { useCallback } from 'react'
import ChannelCard from '../ChannelCard'
import styles from './CategoryCard.module.scss'

const CategoryCardView = ({
  id,
  name,
  items
}: {
  id: string
  name?: string
  items: string[]
}) => {
  const DroppableComponent = useCallback(
    (provided: DroppableProvided) => (
      <div
        className={styles.category}
        {...provided.droppableProps}
        ref={provided.innerRef}
      >
        {name && <h4 className={styles.name}>{name}</h4>}
        {items.map((channelID, index) => (
          <ChannelCard.Draggable key={channelID} id={channelID} index={index} />
        ))}
        {provided.placeholder}
      </div>
    ),
    [name, items]
  )

  return (
    <Droppable droppableId={id} direction='vertical'>
      {DroppableComponent}
    </Droppable>
  )
}

export default CategoryCardView
