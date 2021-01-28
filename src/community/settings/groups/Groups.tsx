import { faBoxOpen } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DragDropContext, Droppable } from '@react-forked/dnd'
import React, { Suspense, useCallback } from 'react'
import { queryCache, useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { Auth } from '../../../authentication/state'
import Button from '../../../components/Button'
import Loader from '../../../components/Loader'
import { UI } from '../../../state/ui'
import { ModalTypes, clientGateway } from '../../../utils/constants'
import { getCommunity, getGroups, GroupResponse } from '../../remote'
import styles from './Groups.module.scss'
import Group from './Group'

const reorder = (
  list: GroupResponse[],
  startIndex: number,
  endIndex: number
): GroupResponse[] => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

const View = () => {
  const { token } = Auth.useContainer()
  const { setModal } = UI.useContainer()
  const { id } = useParams<{ id: string }>()
  const groups = useQuery(['groups', id, token], getGroups)
  const community = useQuery(['community', id, token], getCommunity)

  const onDragEnd = useCallback(
    async (result) => {
      if (
        !result.destination ||
        result.destination.index === result.source.index
      )
        return
      const items = reorder(
        groups.data || [],
        result.source.index,
        result.destination.index
      )
      queryCache.setQueryData(['groups', id, token], () => {
        return items
      })
      await clientGateway.patch(
        `/communities/${id}/groups`,
        {
          order: items.map((item) => item.id)
        },
        {
          headers: {
            Authorization: token
          }
        }
      )
    },
    [groups.data, id, token]
  )

  const DroppableComponent = useCallback(
    (provided, snapshot) => (
      <div
        className={styles.body}
        {...provided.droppableProps}
        ref={provided.innerRef}
      >
        {groups.data?.map(
          (group, index) =>
            group && (
              <Group.Draggable id={group.id} index={index} key={group.id} />
            )
        )}
      </div>
    ),
    [groups.data]
  )

  return (
    <Suspense fallback={<Loader />}>
      <div className={styles.wrapper}>
        <div className={styles.groups}>
          {groups.data && groups.data?.length > 0 ? (
            <>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='groups' direction='vertical'>
                  {DroppableComponent}
                </Droppable>
              </DragDropContext>
            </>
          ) : (
            <>
              <div className={styles.empty}>
                <FontAwesomeIcon size={'5x'} icon={faBoxOpen} />
                <br />
                <h2>No permission groups in this community!</h2>
                <br />
                <br />
                <Button
                  type='button'
                  onClick={() => setModal({ name: ModalTypes.NEW_PERMISSION })}
                >
                  Create Permission Group
                </Button>
              </div>
            </>
          )}
          <Group.Card
            id={id}
            permissions={community.data?.base_permissions ?? []}
            base={true}
          />
        </div>
      </div>
    </Suspense>
  )
}

export default View
