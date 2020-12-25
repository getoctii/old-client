import {
  faBoxOpen,
  faChevronLeft,
  faCrown,
  faHouseLeave,
  faPaperPlane
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion } from 'framer-motion'
import moment from 'moment'
import React, { Suspense, useRef, useState } from 'react'
import { queryCache, useInfiniteQuery, useQuery } from 'react-query'
import { useHistory, useParams } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Waypoint } from 'react-waypoint'
import { Auth } from '../authentication/state'
import Button from '../components/Button'
import Loader from '../components/Loader'
import { createConversation } from '../conversation/remote'
import { ParticipantsResponse, State } from '../user/remote'
import { clientGateway } from '../utils/constants'
import styles from './Members.module.scss'
import { getCommunity } from './remote'

interface MemberType {
  id: string
  user: {
    id: string
    username: string
    avatar: string
    state: State
    discriminator: number
  }
  created_at: string
  updated_at: string
}

const Member = ({ member, owner }: { member: MemberType; owner?: string }) => {
  const isMobile = useMedia('(max-width: 940px)')
  const { id, token } = Auth.useContainer()
  const history = useHistory()
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
        style={{ backgroundImage: `url('${member.user.avatar}')` }}
      >
        {' '}
        {member.user && (
          <div
            className={`${styles.badge} ${
              member.user.state === State.online
                ? styles.online
                : member.user.state === State.dnd
                ? styles.dnd
                : member.user.state === State.idle
                ? styles.idle
                : member.user.state === State.offline
                ? styles.offline
                : ''
            }`}
          />
        )}
      </div>
      <div className={styles.info}>
        <h4>
          {member.user?.username}#
          {member.user?.discriminator === 0
            ? 'inn'
            : member.user?.discriminator.toString().padStart(4, '0')}
          {member.user.id === owner && <FontAwesomeIcon icon={faCrown} />}
        </h4>
        <time>{moment.utc(member.created_at).local().calendar()}</time>
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
                  participant.conversation.participants.includes(member.user.id)
                )
                if (!cache || !participant) {
                  const result = await createConversation(token!, {
                    recipient: member.user.id
                  })
                  if (result.id) history.push(`/conversations/${result.id}`)
                } else {
                  history.push(`/conversations/${participant.conversation.id}`)
                }
              }}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              Message
            </Button>
          )}
          {id === owner && member.user.id !== id && (
            <Button type='button' className={styles.kick}>
              <FontAwesomeIcon icon={faHouseLeave} />
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}

export const Members = () => {
  const history = useHistory()
  const { token } = Auth.useContainer()
  const { id } = useParams<{ id: string }>()
  const community = useQuery(['community', id, token], getCommunity)
  const fetchMembers = async (_: string, community: string, date: string) => {
    return (
      await clientGateway.get<MemberType[]>(
        `/communities/${community}/members`,
        {
          headers: { Authorization: token },
          params: { created_at: date }
        }
      )
    ).data
  }
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<MemberType[], any>(
    ['members', id],
    fetchMembers,
    {
      getFetchMore: (last) => {
        return last.length < 25 ? undefined : last[last.length - 1]?.created_at
      }
    }
  )

  const members = data?.flat() || []

  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const isMobile = useMedia('(max-width: 940px)')
  return (
    <Suspense fallback={<Loader />}>
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
                  style={{ backgroundImage: `url('${community.data?.icon}')` }}
                />
              )}
              <div className={styles.title}>
                <small>{community.data?.name}</small>
                <h2>Members</h2>
              </div>
            </div>
            <div className={styles.body}>
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
                        if (!ref.current || !ref.current.scrollHeight) return
                        setLoading(true)
                        const oldHeight = ref.current.scrollHeight
                        const oldTop = ref.current.scrollTop
                        await fetchMore()
                        ref.current.scrollTop = ref?.current?.scrollHeight
                          ? ref.current.scrollHeight - oldHeight + oldTop
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
    </Suspense>
  )
}
