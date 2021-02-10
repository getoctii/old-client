import React, {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef
} from 'react'
import styles from './Sidebar.module.scss'
import { UI } from '../state/ui'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInbox, faPlus } from '@fortawesome/pro-solid-svg-icons'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Button from '../components/Button'
import { DragDropContext, Droppable, Draggable } from '@react-forked/dnd'
import { useMedia } from 'react-use'
import {
  getCommunities,
  getMentions,
  getParticipants,
  getUnreads,
  getUser,
  MembersResponse,
  State
} from '../user/remote'
import { isPlatform } from '@ionic/react'
import { useScroll } from 'react-use'
import { ScrollPosition } from '../state/scroll'
import { getCommunity } from '../community/remote'
import { ModalTypes } from '../utils/constants'
import { useSuspenseStorageItem } from '../utils/storage'
import { faUsers } from '@fortawesome/pro-duotone-svg-icons'

const reorder = (
  list: MembersResponse,
  startIndex: number,
  endIndex: number
): MembersResponse => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const Community = memo(
  ({
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
    const { token, id } = Auth.useContainer()
    const match = useRouteMatch<{
      tab?: string
      id?: string
    }>('/:tab/:id')
    const history = useHistory()
    const communityFull = useQuery(
      ['community', community.id, token],
      getCommunity
    )
    const unreads = useQuery(['unreads', id, token], getUnreads)
    const mentions = useQuery(['mentions', id, token], getMentions)

    const mentionsCount = useMemo(
      () =>
        communityFull.data?.channels
          .map(
            (channel) =>
              mentions.data?.[channel]?.filter((mention) => !mention.read)
                .length ?? 0
          )
          .reduce((acc, curr) => acc + curr, 0),
      [communityFull, mentions]
    )

    const draggableChild = useCallback(
      (provided) => (
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
            if (
              match?.params.tab === 'communities' &&
              match.params.id === community.id
            )
              return
            return history.push(`/communities/${community.id}`)
          }}
        >
          <img src={community.icon} alt={community.name} />
          {match?.params.id !== community.id &&
            (mentionsCount && mentionsCount > 0 ? (
              <div
                className={`${styles.mention} ${
                  mentionsCount > 9 ? styles.pill : ''
                }`}
              >
                <span>{mentionsCount > 99 ? '99+' : mentionsCount}</span>
              </div>
            ) : (
              communityFull.data?.channels.some((channelID) => {
                const channel = unreads.data?.[channelID]
                return channel?.last_message_id !== channel?.read
              }) && <div className={`${styles.badge}`} />
            ))}
        </div>
      ),
      [community, match, unreads, mentionsCount, communityFull, history]
    )

    return (
      <Draggable draggableId={community.id} index={index}>
        {draggableChild}
      </Draggable>
    )
  }
)

const Placeholder = () => {
  const length = useMemo(() => Math.floor(Math.random() * 10) + 1, [])
  return (
    <>
      {Array.from(Array(length).keys()).map((_, index) => (
        <div key={index} className={styles.communityPlaceholder} />
      ))}
    </>
  )
}

const Communities = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { id, token } = Auth.useContainer()
  const communities = useQuery(['communities', id, token], getCommunities)
  const [communitiesOrder, setCommunitiesOrder] = useSuspenseStorageItem<
    string[]
  >('communities')

  const onDragEnd = useCallback(
    (result) => {
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
    },
    [communities.data, setCommunitiesOrder]
  )

  const DroppableComponent = useCallback(
    (provided) => (
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
    ),
    [communities, communitiesOrder]
  )

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable
        droppableId='list'
        direction={isMobile ? 'horizontal' : 'vertical'}
      >
        {DroppableComponent}
      </Droppable>
    </DragDropContext>
  )
}

const Sidebar = () => {
  const ui = UI.useContainer()
  const auth = Auth.useContainer()
  const history = useHistory()
  const isMobile = useMedia('(max-width: 740px)')
  const matchTab = useRouteMatch<{ tab: string }>('/:tab')
  const user = useQuery(['users', auth.id, auth.token], getUser)

  const scrollRef = useRef<HTMLDivElement>(null)
  const currentScrollPosition = useScroll(scrollRef)
  const [scrollPosition, setScrollPosition] = ScrollPosition.useContainer()
  const unreads = useQuery(['unreads', auth.id, auth.token], getUnreads)
  const mentions = useQuery(['mentions', auth.id, auth.token], getMentions)

  const participants = useQuery(
    ['participants', auth.id, auth.token],
    getParticipants
  )

  const mentionsCount = useMemo(
    () =>
      participants.data
        ?.filter((part) => part.conversation.participants.length > 1)
        .map(
          (part) =>
            mentions.data?.[part.conversation.channel_id]?.filter(
              (mention) => !mention.read
            ).length ?? 0
        )
        .reduce((acc, curr) => acc + curr, 0),
    [participants, mentions]
  )

  useEffect(() => {
    setScrollPosition(currentScrollPosition)
  }, [currentScrollPosition, setScrollPosition])

  useLayoutEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTo(scrollPosition.x, scrollPosition.y)
    // eslint-disable-next-line
  }, [])
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
                  onClick={() => ui.setModal({ name: ModalTypes.STATUS })}
                />
              )}
            </Button>
            <Button
              className={styles.plus}
              type='button'
              onClick={() => ui.setModal({ name: ModalTypes.NEW_COMMUNITY })}
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
          className={`${styles.friends} ${
            matchTab?.params.tab === 'friends' ? styles.selected : ''
          }`}
          type='button'
          onClick={() => {
            history.push('/friends')
          }}
        >
          <FontAwesomeIcon className={styles.symbol} icon={faUsers} size='2x' />
        </Button>
        <Button
          className={`${styles.messages} ${
            matchTab?.params.tab === 'conversations' ? styles.selected : ''
          }`}
          type='button'
          onClick={() => {
            history.push('/')
          }}
        >
          <FontAwesomeIcon className={styles.symbol} icon={faInbox} size='2x' />
          {matchTab?.params.tab !== 'conversations' &&
            matchTab &&
            (mentionsCount && mentionsCount > 0 ? (
              <div
                className={`${styles.mention} ${
                  mentionsCount > 9 ? styles.pill : ''
                }`}
              >
                <span>{mentionsCount > 99 ? '99+' : mentionsCount}</span>
              </div>
            ) : (
              participants.data
                ?.filter((part) => part.conversation.participants.length > 1)
                .some((participant) => {
                  const channel =
                    unreads.data?.[participant.conversation.channel_id]
                  return channel?.last_message_id !== channel?.read
                }) && <div className={`${styles.badge}`} />
            ))}
        </Button>
        <div className={styles.separator} />
        <Suspense fallback={<Placeholder />}>
          <Communities />
        </Suspense>
        <br />
      </div>
      {!isMobile && (
        <div className={styles.pinned}>
          <div className={styles.pinnedWrapper}>
            <Button
              className={`${styles.avatar} ${
                matchTab?.params.tab === 'settings' ? styles.selected : ''
              }`}
              type='button'
            >
              <img
                src={user.data?.avatar}
                alt={user.data?.username}
                onClick={() => {
                  history.push('/settings')
                }}
              />
              {matchTab?.params.tab !== 'settings' && user.data?.state && (
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
                  onClick={() => ui.setModal({ name: ModalTypes.STATUS })}
                />
              )}
            </Button>
            <Button
              className={styles.plus}
              type='button'
              onClick={() => ui.setModal({ name: ModalTypes.NEW_COMMUNITY })}
            >
              <FontAwesomeIcon
                className={styles.symbol}
                icon={faPlus}
                size='2x'
              />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
