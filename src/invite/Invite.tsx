import React, { useEffect, useState } from 'react'
import { Redirect, useHistory, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { getInvite } from './remote'
import { InviteResponse } from '../community/remote'
import styles from './Invite.module.scss'
import { getCommunities, getUser } from '../user/remote'
import Button from '../components/Button'
import { clientGateway } from '../utils/constants'
import { Helmet } from 'react-helmet'

const InvitePreview = (invite: InviteResponse) => {
  const { token, id } = Auth.useContainer()
  const history = useHistory()
  const user = useQuery(['users', invite.author_id, token], getUser)
  const owner = useQuery(['users', invite.community?.owner_id, token], getUser)
  const communities = useQuery(['communities', id, token], getCommunities)
  return (
    <div>
      <h4>{user.data?.username} invited you to a new community!</h4>
      <div className={styles.community}>
        <img alt={invite.community?.name} src={invite.community?.icon} />
        <div className={styles.name}>
          <h4>{invite.community?.name}</h4>
          <p>By {owner.data?.username}</p>
        </div>
      </div>
      <Button
        disabled={
          !!communities.data?.find(
            (member) => member.community.id === invite.community?.id
          )
        }
        type='button'
        onClick={async () => {
          const { data } = await clientGateway.post<{ community_id: string }>(
            `/invites/${invite.code}/use`,
            {},
            { headers: { Authorization: token } }
          )
          history.push(`/communities/${data.community_id}`)
        }}
      >
        {communities.data?.find(
          (member) => member.community.id === invite.community?.id
        )
          ? 'Already Joined'
          : 'Join Community'}
      </Button>
    </div>
  )
}

const Invite = () => {
  const { token } = Auth.useContainer()
  const params = useParams<{ invite: string; code?: string }>()
  const invite = useQuery(['invite', params.invite, token], getInvite)

  return (
    <div className={styles.invite}>
      <Helmet>
        <title>Octii - {invite.data?.community?.name}</title>
      </Helmet>
      {invite.data && <InvitePreview {...invite.data} />}
    </div>
  )
}

const OnBoarding = () => {
  const { setBetaCode } = Auth.useContainer()
  const params = useParams<{ invite: string; code?: string }>()
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (params.code) {
      setBetaCode(params.code)
    }
    setLoading(false)
  }, [params.code, params.invite, setBetaCode])
  return !loading ? (
    <Redirect to={{ pathname: '/authenticate/register' }} />
  ) : (
    <></>
  )
}

const View = () => {
  const { authenticated } = Auth.useContainer()

  return authenticated ? <Invite /> : <OnBoarding />
}

export default View
