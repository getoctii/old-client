import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DragDropContext, Droppable } from '@react-forked/dnd'
import React, { Suspense, useCallback, useMemo } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { Auth } from '../../../authentication/state'
import Button from '../../../components/Button'
import { UI } from '../../../state/ui'
import { ModalTypes, clientGateway } from '../../../utils/constants'
import styles from './Groups.module.scss'
import Group from './Group'
import { queryCache, useQuery } from 'react-query'
import { getGroups } from '../../remote'
import { AnimatePresence } from 'framer-motion'
import { faPlusCircle, faUsersCrown } from '@fortawesome/pro-duotone-svg-icons'

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

const GroupsList = () => {
  const match = useRouteMatch<{ id: string }>('/communities/:id')
  const auth = Auth.useContainer()
  const ui = UI.useContainer()
  const { data: groupIDs } = useQuery(
    ['groups', match?.params.id, auth.token],
    getGroups
  )

  const onDragEnd = useCallback(
    async (result) => {
      if (
        !result.destination ||
        result.destination.index === result.source.index
      )
        return
      const reversedItems = reorder(
        groupIDs ?? [],
        result.source.index,
        result.destination.index
      ).reverse()

      queryCache.setQueryData(
        ['groups', match?.params.id, auth.token],
        reorder(groupIDs ?? [], result.source.index, result.destination.index)
      )
      await clientGateway.patch(
        `/communities/${match?.params?.id}/groups`,
        {
          order: reversedItems
        },
        {
          headers: {
            Authorization: auth.token
          }
        }
      )
    },
    [groupIDs, match?.params?.id, auth.token]
  )

  const DroppableComponent = useCallback(
    (provided) => (
      <div
        className={styles.body}
        {...provided.droppableProps}
        ref={provided.innerRef}
      >
        {groupIDs?.map(
          (groupID, index) =>
            groupID && (
              <Group.Draggable id={groupID} index={index} key={groupID} />
            )
        )}
        {provided.placeholder}
      </div>
    ),
    [groupIDs]
  )

  return (
    <>
      <AnimatePresence>
        {(groupIDs?.length ?? 0) > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='groups' direction='vertical'>
              {DroppableComponent}
            </Droppable>
          </DragDropContext>
        ) : (
          <>
            <div className={styles.empty}>
              <FontAwesomeIcon size={'5x'} icon={faUsersCrown} />
              <h2>Get started with groups!</h2>
              <p>
                Groups allow you to manage community members. For example, you
                can assign members to a moderator role so they can run the
                community while you chill.
              </p>
              <Button
                type='button'
                onClick={() => ui.setModal({ name: ModalTypes.NEW_PERMISSION })}
              >
                Create Group <FontAwesomeIcon icon={faPlusCircle} />
              </Button>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

const GroupsPlaceholder = () => {
  const length = useMemo(() => Math.floor(Math.random() * 4) + 1, [])
  return (
    <div className={styles.groupsPlaceholder}>
      {Array.from(Array(length).keys()).map((_, index) => (
        <Group.Placeholder key={index} className={styles.cardPlaceholder} />
      ))}
    </div>
  )
}

const GroupsView = () => {
  const match = useRouteMatch<{ id: string }>('/communities/:id')

  return (
    <div className={styles.wrapper}>
      <div className={styles.groups}>
        <Suspense fallback={<GroupsPlaceholder />}>
          <GroupsList />
        </Suspense>
        {match?.params.id && (
          <Suspense
            fallback={
              <Group.Placeholder className={styles.completelyRounded} />
            }
          >
            <Group.Card base={true} />
          </Suspense>
        )}
      </div>
    </div>
  )
}

const Groups = { View: GroupsView, Placeholder: GroupsPlaceholder }

export default Groups
