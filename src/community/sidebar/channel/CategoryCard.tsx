import { Droppable, DroppableProvided } from '@react-forked/dnd'
import React, { useCallback } from 'react'
import ChannelCard from '../ChannelCard'
import styles from './CategoryCard.module.scss'
import { ModalTypes, Permissions } from '../../../utils/constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { Permission } from '../../../utils/permissions'
import { UI } from '../../../state/ui'

const CategoryCardView = ({
  id,
  name,
  items
}: {
  id: string
  name: string
  items: string[]
}) => {
  const ui = UI.useContainer()
  const { hasPermissions } = Permission.useContainer()
  const DroppableComponent = useCallback(
    (provided: DroppableProvided) => (
      <div
        className={styles.category}
        {...provided.droppableProps}
        ref={provided.innerRef}
      >
        {id === 'rooms' ? (
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
        ) : (
          <h4 className={styles.name}>{name}</h4>
        )}
        {items.map((channelID, index) => (
          <ChannelCard.Draggable key={channelID} id={channelID} index={index} />
        ))}
        {provided.placeholder}
      </div>
    ),
    [name, items, id, hasPermissions, ui]
  )

  return (
    <Droppable droppableId={id} direction='vertical'>
      {DroppableComponent}
    </Droppable>
  )
}

export default CategoryCardView
