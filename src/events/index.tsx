import useSubscribe from './subscribe'
import useNewMessage from './newMessage'
import useDeletedMessage from './deletedMessage'
import useNewParticipant from './newParticipant'
import useDeletedParticipant from './deletedParticipant'
import useNewMember from './newMember'
import useNewChannel from './newChannel'
import useDeletedChannel from './deletedChannel'
import useDeletedMember from './deletedMember'
import useTyping from './typing'
import useNewVoiceSession from './newVoiceSession'
import useAcceptedVoiceSession from './acceptedVoiceSession'
import useLog from './log'
import useNewMention from './newMention'
import useUpdatedConversation from './updatedConversation'
import useUpdatedMessage from './updatedMessage'

const EventSource = () => {
  const [eventSource] = useSubscribe()

  useLog(eventSource)
  useNewMessage(eventSource)
  useDeletedMessage(eventSource)
  useUpdatedMessage(eventSource)
  useNewParticipant(eventSource)
  useDeletedParticipant(eventSource)
  useNewMember(eventSource)
  useDeletedMember(eventSource)
  useNewChannel(eventSource)
  useDeletedChannel(eventSource)
  useTyping(eventSource)
  useNewVoiceSession(eventSource)
  useAcceptedVoiceSession(eventSource)
  useNewMention(eventSource)
  useUpdatedConversation(eventSource)

  return <></>
}

export default EventSource
