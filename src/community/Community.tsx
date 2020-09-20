import React, { Suspense, useState } from 'react'
import styles from './Community.module.scss'
import Chat from '../chat/Chat'
import { useRouteMatch } from 'react-router-dom'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'
import Loader from '../components/Loader'
import { Channels } from './Channels'
import Empty from '../conversation/empty/Empty'
import Skeleton from 'react-loading-skeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import Button from '../components/Button'
import { NewChannel } from './NewChannel'
import { Settings } from './settings/Settings'

export interface CommunityResponse {
  id: string
  name: string
  icon: string
  large: boolean
  owner_id: string
  channels: {
    name: string
    id: string
  }[]
}

const EmptyCommunity = ({ community }: { community?: CommunityResponse }) => {
  const [createMode, setCreateMode] = useState(false)
  return (
    <div className={styles.communityEmpty}>
      <small>{community?.name || <Skeleton />}</small>
      {!createMode ? (
        <>
          <h1 style={{ marginTop: 0 }}>
            <span role='img' aria-label='hands'>
              🙌{' '}
            </span>
            Hi, this community is empty.
          </h1>
          <Button
            type='button'
            className={styles.createButton}
            style={{ maxWidth: '300px', marginTop: 0 }}
            onClick={() => {
              setCreateMode(true)
            }}
          >
            Create a Channel <FontAwesomeIcon icon={faArrowRight} />
          </Button>
          <br />
          <h3>Here's a meme for now.</h3>
        </>
      ) : (
        <></>
      )}
      {!createMode ? (
        <iframe
          className={styles.video}
          title='sgn'
          width='966'
          height='543'
          src='https://www.youtube.com/embed/dQw4w9WgXcQ'
          frameBorder={0}
          allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen={false}
        ></iframe>
      ) : (
        <NewChannel
          community={community}
          onDismiss={() => setCreateMode(false)}
        />
      )}
    </div>
  )
}

export const Community = () => {
  const auth = Auth.useContainer()
  const matchCommunity = useRouteMatch<{ id: string }>('/communities/:id')
  const matchChannel = useRouteMatch<{ id: string; channelID: string }>(
    '/communities/:id/:channelID'
  )
  console.log(matchCommunity?.params.id)
  const community = useQuery(
    ['community', matchCommunity?.params.id],
    async () =>
      (
        await clientGateway.get<CommunityResponse>(
          `/communities/${matchCommunity?.params.id}`,
          {
            headers: {
              Authorization: auth.token
            }
          }
        )
      ).data
  )
  if (community?.data && community?.data?.channels.length <= 0)
    return <EmptyCommunity community={community.data} />
  return (
    <div className={styles.community} key={matchCommunity?.params.id}>
      <Channels community={community.data} />
      <Suspense fallback={<Loader />}>
        {matchChannel?.params.channelID ? (
          matchChannel.params.channelID === 'settings' ? (
            <Settings />
          ) : (
            <Chat
              title={
                `#${
                  community.data?.channels.find(
                    (channel) => channel.id === matchChannel.params.channelID
                  )?.name
                }` || '#unknown'
              }
              status={''}
              channelID={matchChannel.params.channelID}
            />
          )
        ) : (
          <Empty />
        )}
      </Suspense>
    </div>
  )
}
