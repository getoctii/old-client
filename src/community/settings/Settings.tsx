import React from 'react'
import { General } from './General'
import { Invites } from './Invites'
import { Navbar } from './Navbar'
import { useMedia } from 'react-use'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons'
import {
  Redirect,
  Switch,
  useHistory,
  useParams,
  useRouteMatch
} from 'react-router-dom'
import styles from './Settings.module.scss'
import { getCommunity } from '../remote'
import { Auth } from '../../authentication/state'
import { queryCache, useMutation, useQuery } from 'react-query'
import Button from '../../components/Button'
import { clientGateway, ModalTypes } from '../../utils/constants'
import { faPlusCircle } from '@fortawesome/pro-duotone-svg-icons'
import { PrivateRoute } from '../../authentication/PrivateRoute'
import Permissions from './groups/Groups'
import { UI } from '../../state/ui'

export const Settings = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const { token } = Auth.useContainer()
  const { id } = useParams<{ id: string }>()
  const community = useQuery(['community', id, token], getCommunity)
  const { path } = useRouteMatch()
  const match = useRouteMatch<{ tab?: string; id: string }>(
    '/communities/:id/settings/:tab?'
  )
  const { setModal } = UI.useContainer()
  const history = useHistory()
  const [createInvite] = useMutation(
    async () =>
      (
        await clientGateway.post(
          `/communities/${id}/invites`,
          {},
          { headers: { Authorization: token } }
        )
      ).data,
    {
      onSuccess: async () => {
        await queryCache.invalidateQueries(['invites', id, token])
      }
    }
  )
  return (
    <div className={styles.wrapper}>
      <div className={styles.settings}>
        <div className={styles.header}>
          {isMobile ? (
            <div
              className={styles.icon}
              onClick={() => isMobile && history.push(`/communities/${id}`)}
            >
              <FontAwesomeIcon
                className={styles.backButton}
                icon={faChevronLeft}
              />
            </div>
          ) : (
            <div
              className={styles.icon}
              style={{ backgroundImage: `url('${community.data?.icon}')` }}
            />
          )}
          <div className={styles.title}>
            <small>{community.data?.name}</small>
            <h2>Settings</h2>
          </div>
          {match?.params.tab === 'invites' ? (
            <Button
              className={styles.newButton}
              type='button'
              onClick={async () => await createInvite()}
            >
              {isMobile ? (
                <FontAwesomeIcon icon={faPlusCircle} />
              ) : (
                'New Invite'
              )}
            </Button>
          ) : match?.params.tab === 'groups' ? (
            <Button
              className={styles.newButton}
              type='button'
              onClick={() => setModal({ name: ModalTypes.NEW_PERMISSION })}
            >
              {isMobile ? <FontAwesomeIcon icon={faPlusCircle} /> : 'New Group'}
            </Button>
          ) : (
            <></>
          )}
        </div>

        <Navbar />
        <Switch>
          <PrivateRoute path={`${path}/invites`} component={Invites} exact />
          <PrivateRoute path={`${path}/groups`} component={Permissions} exact />
          <PrivateRoute path={`${path}/general`} component={General} exact />
          <Redirect path='*' to={`/communities/${id}/settings/general`} />
        </Switch>
      </div>
    </div>
  )
}
