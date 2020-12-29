import React, { useEffect, useMemo, useState } from 'react'
import { queryCache, useQuery } from 'react-query'
import styles from './Mentions.module.scss'
import { getUser, UserResponse } from '../user/remote'
import { Auth } from '../authentication/state'
import { clientGateway } from '../utils/constants'
import { useDebounce } from 'react-use'
import { getMembers } from '../community/remote'

type onMention = (id: string) => void

const Mention = ({
  user: { username, avatar, id },
  onMention,
  selected
}: {
  user: UserResponse
  onMention: onMention
  selected: boolean
}) => {
  return (
    <div
      className={`${styles.mention} ${selected ? styles.selected : ''}`}
      onClick={() => {
        onMention(id)
      }}
    >
      <div
        className={styles.img}
        style={{ backgroundImage: `url('${avatar}')` }}
      />
      {username}#0001
    </div>
  )
}

const fetchManyUsers = (_: string, ids: string[], token: string) => {
  return Promise.all(
    ids.map((id) => queryCache.fetchQuery(['users', id, token], getUser))
  )
}

const Conversation = ({
  ids,
  search,
  onMention,
  selected,
  onFiltered
}: {
  ids: string[]
  search: string
  onMention: onMention
  selected: number
  onFiltered: (users: UserResponse[]) => void
}) => {
  const { token } = Auth.useContainer()
  const { data: users } = useQuery(['users', ids, token], fetchManyUsers)
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
        {results?.map((user, index) => (
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

const Community = ({
  communityID,
  search,
  onMention,
  selected,
  onFiltered
}: {
  communityID: string
  search: string
  onMention: onMention
  selected: number
  onFiltered: (users: UserResponse[]) => void
}) => {
  const { token, id } = Auth.useContainer()
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useDebounce(() => setDebouncedSearch(search), 300, [search])
  const { data: members } = useQuery(
    ['members', communityID, debouncedSearch, token],
    searchCommunityMembers
  )
  const defaultMembers = useQuery(['members', communityID, token], getMembers)

  const filteredMembers = useMemo(
    () => members?.filter((member) => member.id !== id),
    [members, id]
  )

  useEffect(() => {
    onFiltered(filteredMembers?.map((member) => member.user) ?? [])
  }, [filteredMembers, onFiltered])

  return (
    <div
      className={styles.mentionPopup}
      onMouseDown={(e) => {
        e.preventDefault()
      }}
    >
      <div className={styles.mentions}>
        {filteredMembers && filteredMembers.length > 0
          ? filteredMembers.map((member, index) => (
              <Mention
                key={member.id}
                user={member.user}
                onMention={onMention}
                selected={index === selected}
              />
            ))
          : defaultMembers?.data
              ?.filter((member) => member.user.id !== id)
              .map((member, index) => (
                <Mention
                  key={member.id}
                  user={member.user}
                  onMention={onMention}
                  selected={index === selected}
                />
              ))}
      </div>
    </div>
  )
}

const Mentions = { Conversation, Community }

export default Mentions