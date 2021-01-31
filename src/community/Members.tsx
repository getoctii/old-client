import {
  faBoxOpen,
  faChevronLeft,
  faCrown,
  faPaperPlane
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
import { createConversation } from '../conversation/remote'
import { getUser, ParticipantsResponse } from '../user/remote'
import styles from './Members.module.scss'
import {
  getCommunity,
  getGroup,
  getMembers,
  getMember,
  MemberResponse
} from './remote'
import Icon from '../user/Icon'
import { faEllipsisHAlt } from '@fortawesome/pro-duotone-svg-icons'
import { UI } from '../state/ui'
import { ModalTypes, Permissions } from '../utils/constants'
import { Permission } from '../utils/permissions'

dayjs.extend(dayjsUTC)
dayjs.extend(dayjsCalendar)

const Group = ({ id }: { id: string }) => {
  const { token } = Auth.useContainer()
  const group = useQuery(['group', id, token], getGroup)
  return (
    <div
      className={styles.group}
      style={{ background: `${group.data?.color}` }}
    >
      {group.data?.name}
    </div>
  )
}

const MemberCard = memo(
  ({
    memberObj,
    owner,
    communityID
  }: {
    memberObj: MemberResponse
    owner?: string
    communityID?: string
  }) => {
    const isMobile = useMedia('(max-width: 740px)')
    const { id, token } = Auth.useContainer()
    const history = useHistory()
    const ui = UI.useContainer()
    const member = useQuery(['member', memberObj.id, token], getMember)
    const user = useQuery(['users', memberObj.user_id, token], getUser)
    const { hasPermissions } = Permission.useContainer()
    return (
      <div className={styles.member}>
        <Icon avatar={user.data?.avatar} state={user.data?.state} />
        <div className={styles.info}>
          <h4>
            {user.data?.username}#
            {user.data?.discriminator === 0
              ? 'inn'
              : user.data?.discriminator.toString().padStart(4, '0')}
            {user.data?.id === owner && <FontAwesomeIcon icon={faCrown} />}
          </h4>
          <time>{dayjs.utc(member?.data?.created_at).local().calendar()}</time>
        </div>
        <div className={styles.groups}>
          {member?.data && member.data.groups.length > 0 && (
            <div className={styles.overflowGroup}>
              {member.data.groups.map((group) => (
                <Group id={group} key={group} />
              ))}
            </div>
          )}

          {hasPermissions([Permissions.MANAGE_GROUPS]) && (
            <Button
              type='button'
              className={`${styles.addGroup} ${
                member.data && member.data.groups.length < 1
                  ? styles.noGroups
                  : ''
              }`}
              onClick={() => {
                if (!communityID) return
                ui.setModal({
                  name: ModalTypes.MANAGE_MEMBER_GROUPS,
                  props: {
                    memberID: memberObj.id,
                    userID: memberObj.user_id,
                    communityID: communityID
                  }
                })
              }}
            >
              {member.data && member.data.groups.length < 1 ? (
                'Add Group'
              ) : (
                <FontAwesomeIcon icon={faEllipsisHAlt} />
              )}
            </Button>
          )}
        </div>
        {!isMobile && (
          <div className={styles.actions}>
            {user.data?.id !== id && (
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
                      memberObj.user_id
                    )
                  )
                  if (!cache || !participant) {
                    const result = await createConversation(token!, {
                      recipient: memberObj.user_id
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
          </div>
        )}
      </div>
    )
  }
)

const MembersList = () => {
  const history = useHistory()
  const { token } = Auth.useContainer()
  const { id } = useParams<{ id: string }>()
  const community = useQuery(['community', id, token], getCommunity)
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<
    MemberResponse[],
    any
  >(['members', id, token], getMembers, {
    getFetchMore: (last) => {
      return last.length < 25 ? undefined : last[last.length - 1]?.id
    }
  })
  const members = useMemo(() => data?.flat() || [], [data])
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const isMobile = useMedia('(max-width: 740px)')
  return (
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
              {members.map(
                (member) =>
                  member && (
                    <Suspense fallback={<MemberPlaceholder />}>
                      <MemberCard
                        communityID={community.data?.id}
                        memberObj={member}
                        owner={community.data?.owner_id}
                        key={member.id}
                      />
                    </Suspense>
                  )
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
              ) : !!loading && canFetchMore ? (
                <div key='loader' className={styles.loader}>
                  <h5>Loading more...</h5>
                </div>
              ) : (
                <></>
              )}
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
  )
}

const MemberPlaceholder = () => {
  return (
    <div className={styles.memberPlaceholder}>
      <div />
      <div className={styles.info}></div>
    </div>
  )
}

const MembersPlaceholder = () => {
  const length = useMemo(() => Math.floor(Math.random() * 4) + 1, [])
  return (
    <div className={styles.membersPlaceholder}>
      <div className={styles.header}>
        <div className={styles.icon} />
        <div className={styles.title}>
          <div className={styles.community} />
          <div className={styles.subtitle} />
        </div>
      </div>
      <div className={styles.body}>
        {Array.from(Array(length).keys()).map((_, index) => (
          <MemberPlaceholder key={index} />
        ))}
      </div>
    </div>
  )
}

const Members = {
  View: MembersList,
  Placeholder: MembersPlaceholder
}

export default Members
