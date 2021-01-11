import {
  faBoxOpen,
  faChevronLeft,
  faCrown,
  faPaperPlane
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion } from 'framer-motion'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import React, { memo, Suspense, useMemo, useRef, useState } from 'react'
import { queryCache, useInfiniteQuery, useQuery } from 'react-query'
import { useHistory, useParams } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Waypoint } from 'react-waypoint'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Loader from '../components/Loader'
import { createConversation } from '../conversation/remote'
import { getUser, ParticipantsResponse, State } from '../user/remote'
import styles from './Members.module.scss'
import { getCommunity, getMembers, Member as MemberType } from './remote'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

const Member = memo(
  ({ member, owner }: { member: MemberType; owner?: string }) => {
    const isMobile = useMedia('(max-width: 740px)')
    const { id, token } = Auth.useContainer()
    const history = useHistory()
    const user = useQuery(['users', member.user.id, token], getUser)
    return (
      <motion.div
        className={styles.member}
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1,
          transition: { y: { stiffness: 1000, velocity: -100 } }
        }}
        exit={{
          opacity: 0
        }}
      >
        <div
          className={styles.icon}
          style={{ backgroundImage: `url('${user.data?.avatar}')` }}
        >
          {' '}
          {user && (
            <div
              className={`${styles.badge} ${
                user.data?.state === State.online
                  ? styles.online
                  : user.data?.state === State.dnd
                  ? styles.dnd
                  : user.data?.state === State.idle
                  ? styles.idle
                  : user.data?.state === State.offline
                  ? styles.offline
                  : ''
              }`}
            />
          )}
        </div>
        <div className={styles.info}>
          <h4>
            {user.data?.username}#
            {user.data?.discriminator === 0
              ? 'inn'
              : user.data?.discriminator.toString().padStart(4, '0')}
            {user.data?.id === owner && <FontAwesomeIcon icon={faCrown} />}
          </h4>
          <time>{dayjs.utc(member.created_at).local().calendar()}</time>
        </div>
        {!isMobile && (
          <div className={styles.actions}>
            {member.user.id !== id && (
              <Button
                type='button'
                onClick={async () => {
                  const cache = queryCache.getQueryData([
                    'participants',
                    id,
                    token
                  ]) as ParticipantsResponse
                  const participant = cache?.find((participant) =>
                    participant.conversation.participants.includes(
                      member.user.id
                    )
                  )
                  if (!cache || !participant) {
                    const result = await createConversation(token!, {
                      recipient: member.user.id
                    })
                    if (result.id) history.push(`/conversations/${result.id}`)
                  } else {
                    history.push(
                      `/conversations/${participant.conversation.id}`
                    )
                  }
                }}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                Message
              </Button>
            )}
            {/* NOTE: Kick Button. Disabled until impl in backend */}
            {/* {id === owner && member.user.id !== id && (
            <Button type='button' className={styles.kick}>
              <FontAwesomeIcon icon={faHouseLeave} />
            </Button>
          )} */}
          </div>
        )}
      </motion.div>
    )
  }
)

export const Members = () => {
  const history = useHistory()
  const { token } = Auth.useContainer()
  const { id } = useParams<{ id: string }>()
  const community = useQuery(['community', id, token], getCommunity)
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<MemberType[], any>(
    ['members', id, token],
    getMembers,
    {
      getFetchMore: (last) => {
        return last.length < 25 ? undefined : last[last.length - 1]?.created_at
      }
    }
  )
  const members = useMemo(() => data?.flat() || [], [data])
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <Suspense fallback={<Loader />}>
      <div className={styles.wrapper}>
        <div className={styles.members}>
          {members.length > 0 ? (
            <>
              <div className={styles.header}>
                {isMobile ? (
                  <div
                    className={styles.icon}
                    onClick={() =>
                      isMobile &&
                      history.push(`/communities/${community.data?.id}`)
                    }
                  >
                    <FontAwesomeIcon
                      className={styles.backButton}
                      icon={faChevronLeft}
                    />
                  </div>
                ) : (
                  <div
                    className={styles.icon}
                    style={{
                      backgroundImage: `url('${community.data?.icon}')`
                    }}
                  />
                )}
                <div className={styles.title}>
                  <small>{community.data?.name}</small>
                  <h2>Members</h2>
                </div>
              </div>
              <div className={styles.body} ref={ref}>
                <AnimatePresence>
                  {members.map(
                    (member) =>
                      member && (
                        <Member
                          member={member}
                          owner={community.data?.owner_id}
                          key={member.id}
                        />
                      )
                  )}
                  {loading && (
                    <div key='loader' className={styles.loader}>
                      <h5>Loading more...</h5>
                    </div>
                  )}
                  {!loading && canFetchMore ? (
                    <Waypoint
                      bottomOffset={20}
                      onEnter={async () => {
                        try {
                          const current = ref.current
                          if (!current || !current.scrollHeight) return
                          setLoading(true)
                          const oldHeight = current.scrollHeight
                          const oldTop = current.scrollTop
                          await fetchMore()
                          current.scrollTop = current.scrollHeight
                            ? current.scrollHeight - oldHeight + oldTop
                            : 0
                        } finally {
                          setLoading(false)
                        }
                      }}
                    />
                  ) : (
                    <></>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <div className={styles.membersEmpty}>
                <FontAwesomeIcon size={'5x'} icon={faBoxOpen} />
                <br />
                <h2>No members in this community!</h2>
                <br />
                <br />
              </div>
            </>
          )}
        </div>
      </div>
    </Suspense>
  )
}
