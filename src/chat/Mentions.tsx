import React, { useEffect, useMemo } from 'react'
import { queryCache, useQuery } from 'react-query'
import styles from './Mentions.module.scss'
import { getUser, UserResponse } from '../user/remote'
import { Auth } from '../authentication/state'

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

const Mentions = ({
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

export default Mentions
