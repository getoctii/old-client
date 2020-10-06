import React, { useState } from 'react'
import styles from './Sidebar.module.scss'
import { UI } from '../uiStore'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCog, faInbox, faPlus } from '@fortawesome/pro-solid-svg-icons'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Button from '../components/Button'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { CommunityResponse } from '../community/remote'

type UserResponse = {
  id: string
  avatar: string
  username: string
  discriminator: number
}

type MembersResponse = {
  id: string
  community: {
    id: string
    name: string
    icon?: string
    large: boolean
  }
}[]

const reorder = (list: any, startIndex: number, endIndex: number): any => {
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
        <Button
          type='button'
          key={community.id}
          style={{}}
          className={
            match?.params.tab === 'communities' &&
            match.params.id === community.id
              ? `${styles.icon} ${styles.selected}`
              : styles.icon
          }
          props={{
            ref: provided.innerRef,
            ...provided.draggableProps,
            ...provided.dragHandleProps,
            style: {
              ...provided.draggableProps.style,
              backgroundImage: `url(${community.icon})`
            }
          }}
          onClick={() => {
            return history.push(`/communities/${community.id}`)
          }}
        />
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
  const [communitiesList, setCommunitiesList] = useState(
    communities?.data || []
  )
  return (
    <div className={styles.sidebar}>
      <Button
        className={styles.avatar}
        type='button'
        onClick={() => ui.setModal('settings')}
      >
        <img src={user.data?.avatar} alt={user.data?.username} />
        <div className={styles.overlay}>
          <FontAwesomeIcon icon={faUserCog} size='2x' />
        </div>
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
      <Button
        className={styles.plus}
        type='button'
        onClick={() => ui.setModal('newCommunity')}
      >
        <FontAwesomeIcon className={styles.symbol} icon={faPlus} size='2x' />
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
          setCommunitiesList(items)
        }}
      >
        <Droppable droppableId='list'>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {communitiesList.map((member, index) => {
                return (
                  <Community
                    key={member.community.id}
                    community={member.community}
                    index={index}
                  />
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <br />
    </div>
  )
}
