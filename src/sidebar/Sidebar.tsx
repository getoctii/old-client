import React from 'react'
import styles from './Sidebar.module.scss'
import { UI } from '../state/ui'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUserCog,
  faInbox,
  faPlus,
  faThLarge
} from '@fortawesome/pro-solid-svg-icons'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Button from '../components/Button'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useLocalStorage } from 'react-use'
import { State, UserResponse } from '../user/remote'

type MembersResponse = {
  id: string
  community: {
    id: string
    name: string
    icon?: string
    large: boolean
  }
}[]

const reorder = (list: any[], startIndex: number, endIndex: number): any[] => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const Community = ({
  community,
  index
}: {
  community: {
    id: string
    name: string
    icon?: string
    large: boolean
  }
  index: number
}) => {
  const match = useRouteMatch<{
    tab?: string
    id?: string
  }>('/:tab/:id')
  const history = useHistory()
  return (
    <Draggable draggableId={community.id} index={index}>
      {(provided) => (
        <div
          key={community.id}
          style={provided.draggableProps.style}
          className={
            match?.params.tab === 'communities' &&
            match.params.id === community.id
              ? `${styles.icon} ${styles.selected}`
              : styles.icon
          }
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => {
            return history.push(`/communities/${community.id}`)
          }}
        >
          <img src={community.icon} alt={community.name} />
        </div>
      )}
    </Draggable>
  )
}

export const Sidebar = () => {
  const ui = UI.useContainer()
  const auth = Auth.useContainer()
  const history = useHistory()
  const match = useRouteMatch<{
    tab?: string
    id?: string
  }>('/:tab/:id')
  const user = useQuery(
    ['users', auth.id],
    async (key, userID) =>
      (
        await clientGateway.get<UserResponse>(`/users/${userID}`, {
          headers: {
            Authorization: auth.token
          }
        })
      ).data
  )
  const communities = useQuery(
    ['communities'],
    async () =>
      (
        await clientGateway.get<MembersResponse>(`/users/${auth.id}/members`, {
          headers: {
            Authorization: auth.token
          }
        })
      ).data
  )
  const [communitiesOrder, setCommunitiesOrder] = useLocalStorage<string[]>(
    'communities',
    communities.data?.map((member) => member.community.id) ?? []
  )
  return (
    <div className={styles.sidebar}>
      <div className={styles.scrollable}>
        <Button
          className={
            match?.params.tab === 'hub' || !match
              ? `${styles.hub} ${styles.selected}`
              : styles.hub
          }
          type='button'
          onClick={() => {
            history.push('/')
          }}
        >
          <FontAwesomeIcon
            className={styles.symbol}
            icon={faThLarge}
            size='2x'
          />
        </Button>
        <Button
          className={
            match?.params.tab === 'conversations' || !match
              ? `${styles.messages} ${styles.selected}`
              : styles.messages
          }
          type='button'
          onClick={() => {
            history.push('/')
          }}
        >
          <FontAwesomeIcon className={styles.symbol} icon={faInbox} size='2x' />
        </Button>

        <div className={styles.separator} />
        <DragDropContext
          onDragEnd={(result) => {
            if (
              !result.destination ||
              result.destination.index === result.source.index
            )
              return
            const items = reorder(
              communities.data || [],
              result.source.index,
              result.destination.index
            )
            setCommunitiesOrder(items.map((c) => c.community.id))
          }}
        >
          <Droppable droppableId='list'>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {(communities?.data ?? [])
                  .sort(
                    (a, b) =>
                      (communitiesOrder?.indexOf(a.community.id) ?? 0) -
                      (communitiesOrder?.indexOf(b.community.id) ?? 0)
                  )
                  .map((member, index) => (
                    <Community
                      key={member.community.id}
                      community={member.community}
                      index={index}
                    />
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <br />
      </div>
      <div className={styles.pinned}>
        <Button className={styles.avatar} type='button'>
          <img
            src={user.data?.avatar}
            alt={user.data?.username}
            onClick={() => ui.setModal('settings')}
          />
          <div
            className={styles.overlay}
            onClick={() => ui.setModal('settings')}
          >
            <FontAwesomeIcon icon={faUserCog} size='2x' />
          </div>
          {user.data?.state && (
            <div
              className={`${styles.badge} ${
                user.data.state === State.online
                  ? styles.online
                  : user.data.state === State.dnd
                  ? styles.dnd
                  : user.data.state === State.idle
                  ? styles.idle
                  : user.data.state === State.offline
                  ? styles.offline
                  : ''
              }`}
              onClick={() => ui.setModal('status')}
            />
          )}
        </Button>
        <Button
          className={styles.plus}
          type='button'
          onClick={() => ui.setModal('newCommunity')}
        >
          <FontAwesomeIcon className={styles.symbol} icon={faPlus} size='2x' />
        </Button>
      </div>
    </div>
  )
}
