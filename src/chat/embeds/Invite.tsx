import { faPoop } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useMemo } from 'react'
import { matchPath, useHistory } from 'react-router-dom'
import Button from '../../components/Button'
import styles from './Invite.module.scss'
import { useQuery } from 'react-query'
import { getUseInvite } from '../../invite/remote'
import { Auth } from '../../authentication/state'
import { getCommunities } from '../../user/remote'
import { clientGateway } from '../../utils/constants'

const isInvite = (url: string) =>
  /^https:\/\/octii\.(chat\/invite|com)\/[A-Za-z0-9_-]*/g.test(url)

const InviteEmbed = ({ url }: { url: string }) => {
  const { token, id } = Auth.useContainer()
  const history = useHistory()
  const match = matchPath<{ invite: string; code: string }>(
    new URL(url).pathname,
    {
      path: '/:invite/:code?',
      exact: true,
      strict: false
    }
  )
  const { data: invite } = useQuery(
    [
      'invite',
      match?.params.invite === 'invite'
        ? match?.params.code
        : match?.params.invite,
      token
    ],
    getUseInvite,
    {
      retry: 1
    }
  )
  const { data: communities } = useQuery(
    ['communities', id, token],
    getCommunities
  )
  const isAlreadyInCommunity = useMemo(
    () =>
      !!communities?.find(
        (member) => member.community.id === invite?.community?.id
      ),
    [communities, invite?.community?.id]
  )
  return (
    <div className={styles.inviteEmbed}>
      <div className={styles.details}>
        <img alt={invite?.community?.name} src={invite?.community?.icon} />
        <div className={styles.title}>
          <h4>
            {isAlreadyInCommunity
              ? 'You are already in this community!'
              : "You've been invited to a community!"}
          </h4>
          <h2>{invite?.community?.name}</h2>
        </div>
      </div>
      <Button
        disabled={isAlreadyInCommunity}
        type='button'
        onClick={async () => {
          const { data } = await clientGateway.post<{ community_id: string }>(
            `/invites/${
              match?.params.invite === 'invite'
                ? match?.params.code
                : match?.params.invite
            }/use`,
            {},
            { headers: { Authorization: token } }
          )
          history.push(`/communities/${data.community_id}`)
        }}
      >
        {isAlreadyInCommunity ? 'Joined' : 'Join'}
      </Button>
    </div>
  )
}

const ErrorEmbed = () => {
  return (
    <div className={styles.inviteEmbed}>
      <div className={styles.details}>
        <div className={styles.icon}>
          <FontAwesomeIcon icon={faPoop} />
        </div>

        <div className={styles.title}>
          <h2>Invalid Invite</h2>
        </div>
      </div>
      <Button disabled={true} type='button'>
        Invalid
      </Button>
    </div>
  )
}

const Placeholder = () => {
  return (
    <div className={styles.invitePlaceholder}>
      <div className={styles.details}>
        <div className={styles.icon} />
        <div className={styles.title}>
          <div className={styles.one} />
          <div className={styles.two} />
        </div>
      </div>
      <div className={styles.button} />
    </div>
  )
}

const Invite = {
  Embed: InviteEmbed,
  Placeholder,
  isInvite,
  ErrorEmbed
}

export default Invite
