import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { getInvite } from './remote'
import { Invite } from '../community/remote'
import styles from './Invite.module.scss'
import { getCommunities, getUser } from '../user/remote'
import Button from '../components/Button'
import { clientGateway } from '../utils/constants'

const InvitePreview = (invite: Invite) => {
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
        disabled={!!communities.data?.find((member) => member.community.id === invite.community?.id)}
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
        {communities.data?.find((member) => member.community.id === invite.community?.id) ? 'Already Joined' : 'Join Community'}
      </Button>
    </div>
  )
}

const View = () => {
  const { token } = Auth.useContainer()
  const params = useParams<{ code: string }>()
  const invite = useQuery(['invite', params.code, token], getInvite)

  return (
    <div className={styles.invite}>
      {invite.data && <InvitePreview {...invite.data} />}
    </div>
  )
}

export default View
