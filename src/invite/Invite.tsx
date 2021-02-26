import React, { useEffect, useState } from 'react'
import { Redirect, useHistory, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { getUseInvite } from './remote'
import styles from './Invite.module.scss'
import { getCommunities, getUser } from '../user/remote'
import Button from '../components/Button'
import { clientGateway } from '../utils/constants'
import { Helmet } from 'react-helmet-async'
import { useUser } from '../user/state'

const InvitePreview = (invite: {
  code: string
  author_id: string
  community: {
    id: string
    name: string
    icon: string
    large: boolean
    owner_id: string
  }
}) => {
  const { token, id } = Auth.useContainer()
  const history = useHistory()
  const user = useUser(invite.author_id)
  const owner = useUser(invite.community?.owner_id)
  const communities = useQuery(['communities', id, token], getCommunities)
  return (
    <div>
      <h4>{user?.username} invited you to a new community!</h4>
      <div className={styles.community}>
        <img alt={invite.community?.name} src={invite.community?.icon} />
        <div className={styles.name}>
          <h4>{invite.community?.name}</h4>
          <p>By {owner?.username}</p>
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
  const { data: invite } = useQuery(
    ['useInvite', params.invite, token],
    getUseInvite
  )

  return (
    <div className={styles.invite}>
      <Helmet>
        <title>Octii - {invite?.community?.name}</title>
      </Helmet>
      {invite && <InvitePreview code={params.invite} {...invite} />}
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
