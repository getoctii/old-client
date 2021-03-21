import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot
} from '@react-forked/dnd'
import React, { useCallback, useMemo } from 'react'
import ChannelCard from './ChannelCard'
import styles from './CategoryCard.module.scss'
import { Permission } from '../../../utils/permissions'
import {
  clientGateway,
  ModalTypes,
  Permissions
} from '../../../utils/constants'
import Context from '../../../components/Context'
import { faCopy, faPen, faTrashAlt } from '@fortawesome/pro-duotone-svg-icons'
import { Clipboard } from '@capacitor/core'
import { UI } from '../../../state/ui'
import { useMutation } from 'react-query'
import { Auth } from '../../../authentication/state'
import { ConfirmationType } from '../../../components/Confirmation'
import { useHistory, useRouteMatch } from 'react-router-dom'

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
  const matchTab = useRouteMatch<{ id: string; channelID: string }>(
    '/communities/:id/channels/:channelID'
  )
  const history = useHistory()
  const auth = Auth.useContainer()
  const ui = UI.useContainer()
  const { hasPermissions } = Permission.useContainer()

  const [deleteChannel] = useMutation(
    async () =>
      (
        await clientGateway.delete(`/channels/${id}`, {
          headers: { Authorization: auth.token }
        })
      ).data
  )
  const menuItems = useMemo(() => {
    const items = [
      {
        text: 'Copy ID',
        icon: faCopy,
        danger: false,
        onClick: async () => {
          await Clipboard.write({
            string: id
          })
        }
      }
    ]
    if (hasPermissions([Permissions.MANAGE_CHANNELS])) {
      items.push(
        {
          text: 'Edit Channel',
          icon: faPen,
          danger: false,
          onClick: async () =>
            history.push(
              `/communities/${matchTab?.params.id}/channels/${id}/settings`
            )
        },
        {
          text: 'Delete Channel',
          icon: faTrashAlt,
          danger: true,
          onClick: async () =>
            ui.setModal({
              name: ModalTypes.DELETE_CHANNEL,
              props: {
                type: ConfirmationType.CATEGORY,
                onConfirm: async () => {
                  await deleteChannel()
                  ui.clearModal()
                }
              }
            })
        }
      )
    }
    return items
  }, [hasPermissions, id, deleteChannel, ui, history, matchTab?.params.id])

  const DraggableComponent = useCallback(
    (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
      <Context.Wrapper title={name} message={'Category'} items={menuItems}>
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
      </Context.Wrapper>
    ),
    [id, items, name, menuItems]
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
