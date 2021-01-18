import React, { memo, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import styles from './Mentions.module.scss'
import { fetchManyUsers, getParticipants, UserResponse } from '../user/remote'
import { Auth } from '../authentication/state'
import { clientGateway } from '../utils/constants'
import { useDebounce, useMedia } from 'react-use'
import { getMembers } from '../community/remote'
import { useParams, useRouteMatch } from 'react-router-dom'

type onMention = (id: string) => void

const Mention = ({
  user,
  onMention,
  selected
}: {
  user?: UserResponse
  onMention: onMention
  selected: boolean
}) => {
  if (!user) return <></>
  return (
    <div
      className={`${styles.mention} ${selected ? styles.selected : ''}`}
      onClick={() => onMention(user.id)}
    >
      <div
        className={styles.img}
        style={{ backgroundImage: `url('${user?.avatar}')` }}
      />
      {user?.username}#
      {user?.discriminator === 0
        ? 'inn'
        : user?.discriminator.toString().padStart(4, '0')}
    </div>
  )
}

const MentionsPopup = ({
  usersIDs,
  search,
  selected,
  onMention,
  onFiltered
}: {
  usersIDs: string[]
  search: string
  onMention: onMention
  selected: number
  onFiltered: (users: UserResponse[]) => void
}) => {
  const { token } = Auth.useContainer()
  const { data: users } = useQuery(['users', usersIDs, token], fetchManyUsers)
  const results = useMemo(
    () =>
      search !== ''
        ? users?.filter((user) => user.username.includes(search))
        : users,
    [users, search]
  )
  useEffect(() => {
    onFiltered(results ?? [])
  }, [results, onFiltered])
  return (
    <div
      className={styles.mentionPopup}
      onMouseDown={(e) => {
        e.preventDefault()
      }}
    >
      <div className={styles.mentions}>
        {users?.map((user, index) => (
          <Mention
            key={user.id}
            user={user}
            onMention={onMention}
            selected={index === selected}
          />
        ))}
      </div>
    </div>
  )
}

const Conversation = ({
  search,
  onMention,
  selected,
  onFiltered
}: {
  search: string
  onMention: onMention
  selected: number
  onFiltered: (users: UserResponse[]) => void
}) => {
  const { token, id } = Auth.useContainer()
  const participants = useQuery(['participants', id, token], getParticipants)
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  const conversation = useMemo(
    () =>
      participants.data?.find((p) => p.conversation.id === match?.params.id),
    [participants, match?.params.id]
  )
  if (!conversation) return <></>
  return (
    <MentionsPopup
      usersIDs={conversation.conversation.participants}
      selected={selected}
      search={search}
      onMention={onMention}
      onFiltered={onFiltered}
    />
  )
}

const searchCommunityMembers = async (
  _: string,
  id: string,
  query: string,
  token: string
) =>
  query.length >= 1 && query.length <= 16 && /^[a-zA-Z ]+$/.test(query)
    ? (
        await clientGateway.get<
          {
            id: string
            user: UserResponse
          }[]
        >(`/communities/${id}/members/search`, {
          headers: {
            Authorization: token
          },
          params: {
            query
          }
        })
      ).data
    : []

const Community = memo(
  ({
    search,
    onMention,
    selected,
    onFiltered
  }: {
    search: string
    onMention: onMention
    selected: number
    onFiltered: (users: UserResponse[]) => void
  }) => {
    const params = useParams<{ id: string }>()
    console.log(params)
    const { token, id } = Auth.useContainer()
    const isMobile = useMedia('(max-width: 740px)')
    const [debouncedSearch, setDebouncedSearch] = useState(search)
    useDebounce(() => setDebouncedSearch(search), 300, [search])
    const { data: members } = useQuery(
      ['members', params.id, debouncedSearch, token],
      searchCommunityMembers
    )
    const defaultMembers = useQuery(['members', params.id, token], getMembers)

    const filteredMembers = useMemo(
      () => members?.filter((member) => member.id !== id),
      [members, id]
    )

    const truncatedDefaultMembers = useMemo(
      () =>
        isMobile
          ? defaultMembers.data?.slice(0, 4)
          : defaultMembers.data?.slice(0, 9),
      [defaultMembers, isMobile]
    )
    console.log(truncatedDefaultMembers)
    const truncatedFilteredMembers = useMemo(
      () => filteredMembers?.slice(0, 9),
      [filteredMembers]
    )

    useEffect(() => {
      onFiltered(
        truncatedFilteredMembers && truncatedFilteredMembers.length > 0
          ? truncatedFilteredMembers?.map((member) => member.user)
          : truncatedDefaultMembers?.map((m) => m.user) ?? []
      )
    }, [truncatedDefaultMembers, onFiltered, truncatedFilteredMembers])

    return (
      <div
        className={styles.mentionPopup}
        onMouseDown={(e) => {
          e.preventDefault()
        }}
      >
        <div className={styles.mentions}>
          {truncatedFilteredMembers && truncatedFilteredMembers.length > 0
            ? truncatedFilteredMembers.map((member, index) => (
                <Mention
                  key={member?.id}
                  user={member?.user}
                  onMention={onMention}
                  selected={index === selected}
                />
              ))
            : truncatedDefaultMembers
                ?.filter((member) => member?.user?.id !== id)
                .map((member, index) => (
                  <Mention
                    key={member?.id}
                    user={member?.user}
                    onMention={onMention}
                    selected={index === selected}
                  />
                ))}
        </div>
      </div>
    )
  }
)

const Mentions = { Conversation, Community }

export default Mentions
