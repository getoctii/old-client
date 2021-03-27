import { faCrown, faPaperPlane } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import dayjsCalendar from 'dayjs/plugin/calendar'
import { memo, Suspense, useMemo, useRef, useState } from 'react'
import { queryCache, useInfiniteQuery, useQuery } from 'react-query'
import { useHistory, useParams } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Waypoint } from 'react-waypoint'
import { Auth } from '../../authentication/state'
import Button from '../../components/Button'
import { createConversation } from '../../conversation/remote'
import { ParticipantsResponse } from '../../user/remote'
import styles from './Members.module.scss'
import {
  getCommunity,
  getGroup,
  getMembers,
  getMember,
  MemberResponse
} from '../remote'
import { faEllipsisHAlt, faUsers } from '@fortawesome/pro-duotone-svg-icons'
import { UI } from '../../state/ui'
import { ModalTypes, Permissions } from '../../utils/constants'
import { Permission } from '../../utils/permissions'
import { useUser } from '../../user/state'
import List from '../../components/List'
import Header from '../../components/Header'
import Icon from '../../user/Icon'

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

const MemberCard = memo(({ memberObj }: { memberObj: MemberResponse }) => {
  const { id } = useParams<{ id: string }>()
  const isMobile = useMedia('(max-width: 740px)')
  const auth = Auth.useContainer()
  const history = useHistory()
  const ui = UI.useContainer()
  const member = useQuery(['member', memberObj.id, auth.token], getMember)
  const user = useUser(memberObj.user_id)
  const { hasPermissions, community } = Permission.useContainer()
  return (
    <List.Card
      title={
        <>
          {user?.username}#
          {user?.discriminator === 0
            ? 'inn'
            : user?.discriminator.toString().padStart(4, '0')}
          {user?.id === community?.owner_id && (
            <FontAwesomeIcon icon={faCrown} />
          )}
        </>
      }
      icon={<Icon avatar={user?.avatar} state={user?.state} />}
      subtitle={dayjs.utc(member?.data?.created_at).local().calendar()}
      groups={
        <>
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
                if (!id) return
                ui.setModal({
                  name: ModalTypes.MANAGE_MEMBER_GROUPS,
                  props: {
                    memberID: memberObj.id,
                    userID: memberObj.user_id,
                    communityID: id
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
        </>
      }
      actions={
        <>
          {!isMobile && user?.id !== id && (
            <Button
              className={styles.messageButton}
              type='button'
              onClick={async () => {
                const cache = queryCache.getQueryData([
                  'participants',
                  auth.id,
                  auth.token
                ]) as ParticipantsResponse
                const participant = cache?.find((participant) =>
                  participant.conversation.participants.includes(
                    memberObj.user_id
                  )
                )
                if (!cache || !participant) {
                  const result = await createConversation(auth.token!, {
                    recipient: memberObj.user_id
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
        </>
      }
    />
  )
})

const Members = () => {
  const { token } = Auth.useContainer()
  const { id } = useParams<{ id: string }>()
  const { data: community } = useQuery(['community', id, token], getCommunity)
  const { data, canFetchMore, fetchMore } = useInfiniteQuery<
    MemberResponse[],
    any
  >(['members', id, token], getMembers, {
    getFetchMore: (last) => {
      return last.length < 25 ? undefined : last[last.length - 1]?.id
    }
  })
  const history = useHistory()
  const members = useMemo(() => data?.flat() || [], [data])
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  return (
    <div className={styles.members}>
      <Header
        heading={'Members'}
        subheading={community?.name ?? ''}
        image={community?.icon}
        onBack={() => history.push(`/communities/${id}`)}
      />
      <br />
      <List.View>
        {members.length > 0 ? (
          <>
            {members.map(
              (member) =>
                member && (
                  <Suspense key={member.id} fallback={<List.CardPlaceholder />}>
                    <MemberCard memberObj={member} />
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
          </>
        ) : (
          <List.Empty
            title={'Get started with invites!'}
            description={`An empty community is pretty boring. Invite friends so you can chat around and even invite random people from the internet with invites!`}
            icon={faUsers}
          />
        )}
      </List.View>
    </div>
  )
}

export default Members
