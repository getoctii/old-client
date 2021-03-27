import React, {
  memo,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef
} from 'react'
import styles from './Conversations.module.scss'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import ConversationCard from './ConversationCard'
import { useRouteMatch } from 'react-router-dom'
import { useMedia, useScroll } from 'react-use'
import NewConversation from './NewConversation'
import dayjs from 'dayjs'
import dayjsUTC from 'dayjs/plugin/utc'
import { getParticipants, Participant } from '../user/remote'
import { ScrollPosition } from '../state/scroll'
import StatusBar from '../components/StatusBar'

dayjs.extend(dayjsUTC)

const ConversationCardWrapper = ({
  id,
  last_message_id,
  channel_id,
  people,
  index
}: Participant['conversation'] & { index: number; people: string[] }) => {
  const match = useRouteMatch<{ id: string }>('/conversations/:id')
  return (
    <div key={id}>
      {index !== 0 && (
        <hr className={match?.params.id === id ? styles.hidden : ''} />
      )}
      <Suspense fallback={<ConversationCard.Placeholder />}>
        <ConversationCard.View
          people={people}
          conversationID={id}
          lastMessageID={last_message_id}
          channelID={channel_id}
        />
      </Suspense>
    </div>
  )
}

const ConversationList = memo(() => {
  const auth = Auth.useContainer()

  const participants = useQuery(
    ['participants', auth.id, auth.token],
    getParticipants
  )
  const filteredParticipants = useMemo(
    () =>
      participants.data?.filter(
        (part) => part.conversation.participants.length > 1
      ),
    [participants]
  )

  return (
    <>
      {filteredParticipants && filteredParticipants.length > 0 ? (
        filteredParticipants
          ?.filter(({ conversation }: Participant) => {
            const people = conversation.participants.filter(
              (userID: string) => userID !== auth.id
            )
            return people.length !== 0
          })
          .sort((a, b) => {
            const firstMessage = dayjs
              .utc(a.conversation.last_message_date ?? 0)
              .unix()
            const lastMessage = dayjs
              .utc(b.conversation.last_message_date ?? 0)
              .unix()
            if (lastMessage > firstMessage) return 1
            else if (lastMessage < firstMessage) return -1
            else return 0
          })
          .map(({ conversation }: Participant, index) => {
            const people = conversation.participants.filter(
              (userID: string) => userID !== auth.id
            )
            if (people.length === 0) {
              return <></>
            } else {
              return (
                <ConversationCardWrapper
                  {...conversation}
                  index={index}
                  people={people ?? []}
                />
              )
            }
          })
      ) : (
        <div className={styles.alert}>
          <h4>You aren't in any chats!</h4>
          <p>Use the search bar to create new chats using usernames.</p>
        </div>
      )}
    </>
  )
})

const ConversationsPlaceholder = () => {
  const length = useMemo(() => Math.floor(Math.random() * 10) + 1, [])
  return (
    <>
      {Array.from(Array(length).keys()).map((_, index) => (
        <>
          {index !== 0 && <hr />}
          <ConversationCard.Placeholder key={index} />
        </>
      ))}
    </>
  )
}

export const Conversations = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentScrollPosition = useScroll(scrollRef)
  const {
    conversation: [scrollPosition, setScrollPosition]
  } = ScrollPosition.useContainer()

  useLayoutEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTo(scrollPosition.x, scrollPosition.y)
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    setScrollPosition(currentScrollPosition)
  }, [currentScrollPosition, setScrollPosition])

  return (
    <StatusBar sidebar>
      <div className={styles.sidebar} ref={scrollRef}>
        {isMobile && <div className={styles.statusBar} />}
        <h3>Messages</h3>
        <NewConversation />
        <div className={styles.list}>
          <React.Suspense fallback={<ConversationsPlaceholder />}>
            <ConversationList />
          </React.Suspense>
        </div>
      </div>
    </StatusBar>
  )
}
