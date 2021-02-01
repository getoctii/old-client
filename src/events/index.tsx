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
import useDeletedGroup from './deletedGroup'
import useNewGroup from './newGroup'
import useDeletedGroupMember from './deletedGroupMember'
import useNewGroupMember from './newGroupMember'
import useUpdatedGroup from './updatedGroup'
import useReorderedGroups from './reorderedGroups'
import useUpdatedCommunity from './updatedCommunity'
import useReorderedChannels from './reorderedChannels'

const EventSource = () => {
  const [eventSource] = useSubscribe()

  useLog(eventSource)
  useAcceptedVoiceSession(eventSource)
  useDeletedChannel(eventSource)
  useDeletedGroup(eventSource)
  useDeletedGroupMember(eventSource)
  useDeletedMember(eventSource)
  useDeletedMessage(eventSource)
  useDeletedParticipant(eventSource)
  useNewChannel(eventSource)
  useNewGroup(eventSource)
  useNewGroupMember(eventSource)
  useNewMember(eventSource)
  useNewMention(eventSource)
  useNewMessage(eventSource)
  useNewParticipant(eventSource)
  useNewVoiceSession(eventSource)
  useReorderedChannels(eventSource)
  useReorderedGroups(eventSource)
  useTyping(eventSource)
  useUpdatedConversation(eventSource)
  useUpdatedGroup(eventSource)
  useUpdatedMessage(eventSource)
  useUpdatedCommunity(eventSource)
  return <></>
}

export default EventSource
