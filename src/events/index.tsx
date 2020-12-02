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

const EventSource = () => {
  const [eventSource] = useSubscribe()

  useLog(eventSource)
  useNewMessage(eventSource)
  useDeletedMessage(eventSource)
  useNewParticipant(eventSource)
  useDeletedParticipant(eventSource)
  useNewMember(eventSource)
  useDeletedMember(eventSource)
  useNewChannel(eventSource)
  useDeletedChannel(eventSource)
  useTyping(eventSource)
  useNewVoiceSession(eventSource)
  useAcceptedVoiceSession(eventSource)

  return <></>
}

export default EventSource
