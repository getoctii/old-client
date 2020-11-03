import React, { useEffect, useLayoutEffect, useRef } from 'react'
import styles from './Sidebar.module.scss'
import { UI } from '../state/ui'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInbox, faPlus } from '@fortawesome/pro-solid-svg-icons'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Button from '../components/Button'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useLocalStorage, useMedia } from 'react-use'
import { getUser, State } from '../user/remote'
import { isPlatform } from '@ionic/react'
import { useScroll } from 'react-use'
import { ScrollPosition } from '../state/scroll'

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
  const isMobile = useMedia('(max-width: 940px)')
  const matchTab = useRouteMatch<{ tab: string }>('/:tab')

  const user = useQuery(['users', auth.id, auth.token], getUser)
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentScrollPosition = useScroll(scrollRef)
  const [scrollPosition, setScrollPosition] = ScrollPosition.useContainer()

  useEffect(() => {
    setScrollPosition(currentScrollPosition)
  }, [currentScrollPosition, setScrollPosition])

  useLayoutEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTo(scrollPosition.x, scrollPosition.y)
    // eslint-disable-next-line
  }, [])
  // fuck it ship it
  return (
    <div className={styles.sidebar}>
      <div className={styles.scrollable} ref={scrollRef}>
        {isPlatform('capacitor') && !isMobile && <br />}
        {isMobile && (
          <>
            <Button
              type='button'
              className={`${styles.avatar} ${
                matchTab?.params.tab === 'settings' ? styles.selected : ''
              }`}
            >
              <img
                src={user.data?.avatar}
                alt={user.data?.username}
                onClick={() => history.push('/settings')}
              />
              <div
                className={styles.overlay}
                onClick={() => history.push('/settings')}
              ></div>
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
              <FontAwesomeIcon
                className={styles.symbol}
                icon={faPlus}
                size='2x'
              />
            </Button>
          </>
        )}

        <Button
          className={`${styles.messages} ${
            matchTab?.params.tab === 'conversations' || !matchTab
              ? styles.selected
              : ''
          }`}
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
          <Droppable
            droppableId='list'
            direction={isMobile ? 'horizontal' : 'vertical'}
          >
            {(provided) => (
              <div
                className={styles.list}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
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
      {!isMobile && (
        <div className={styles.pinned}>
          <Button
            className={`${styles.avatar} ${
              matchTab?.params.tab === 'settings' ? styles.selected : ''
            }`}
            type='button'
          >
            <img
              src={user.data?.avatar}
              alt={user.data?.username}
              onClick={() => history.push('/settings')}
            />
            <div
              className={styles.overlay}
              onClick={() => history.push('/settings')}
            />
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
            <FontAwesomeIcon
              className={styles.symbol}
              icon={faPlus}
              size='2x'
            />
          </Button>
        </div>
      )}
    </div>
  )
}
