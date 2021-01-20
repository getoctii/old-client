import { faPoop } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useMemo, useState } from 'react'
import { matchPath, useHistory } from 'react-router-dom'
import Button from '../../components/Button'
import styles from './Invite.module.scss'
import { useQuery } from 'react-query'
import { getInvite } from '../../invite/remote'
import { Auth } from '../../authentication/state'
import { getCommunities } from '../../user/remote'
import { clientGateway } from '../../utils/constants'

const isInvite = (url: string) =>
  /^https:\/\/octii\.chat\/invite\/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/g.test(
    url
  )

const Embed = ({ url }: { url: string }) => {
  const { token, id } = Auth.useContainer()
  const history = useHistory()
  const match = matchPath<{ code: string }>(new URL(url).pathname, {
    path: '/invite/:code',
    exact: true,
    strict: false
  })
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const invite = useQuery(['invite', match?.params.code, token], getInvite, {
    onError: () => {
      setError(true)
      setLoading(false)
    },
    onSuccess: () => {
      setLoading(false)
      setError(false)
    },
    retry: 1,
    suspense: false
  })
  const communities = useQuery(['communities', id, token], getCommunities)
  const isAlreadyInCommunity = useMemo(() => !!communities.data?.find((member) => member.community.id === invite.data?.community?.id), [communities, invite.data?.community?.id])
  return loading ? <Placeholder /> : (
    <div className={styles.inviteEmbed}>
      {error ? <div className={styles.icon}><FontAwesomeIcon icon={faPoop} /></div> :<img alt={invite.data?.community?.name} src={invite.data?.community?.icon}/>}
      <div className={styles.title}>
        {!error ? (
          <>
            <h4>{isAlreadyInCommunity ? 'You are already in this community!' : 'You\'ve been invited to a community!'}</h4>
            <h2>{invite.data?.community?.name}</h2>
          </>
        ) : (
          <h2>Invalid Invite</h2>
        )}
      </div>
      <Button
        disabled={error || isAlreadyInCommunity}
        type='button'
        onClick={async () => {
          const { data } = await clientGateway.post<{ community_id: string }>(
            `/invites/${invite.data?.code}/use`,
            {},
            { headers: { Authorization: token } }
          )
          history.push(`/communities/${data.community_id}`)
        }}
      >
        {error ? 'Invalid' : isAlreadyInCommunity ? 'Joined' : 'Join'}
      </Button>
    </div>
  )
}

const Placeholder = () => {
  return (
    <div className={styles.invitePlaceholder}>
      <div className={styles.icon} />
      <div className={styles.title}>
        <div className={styles.one} />
        <div className={styles.two} />
      </div>
      <div className={styles.button} />
    </div>
  )
}

const Invite = {
  Embed,
  Placeholder,
  isInvite
}

export default Invite
