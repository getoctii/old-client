import React from 'react'
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

const EventSource = () => {
  const [eventSource] = useSubscribe()

  useNewMessage(eventSource)
  useDeletedMessage(eventSource)
  useNewParticipant(eventSource)
  useDeletedParticipant(eventSource)
  useNewMember(eventSource)
  useDeletedMember(eventSource)
  useNewChannel(eventSource)
  useDeletedChannel(eventSource)
  useTyping(eventSource)

  return <></>
}

export default EventSource
