import axios from 'axios'

export const CLIENT_GATEWAY_URL = 'https://gateway.octii.chat'
export const clientGateway = axios.create({
  baseURL: CLIENT_GATEWAY_URL
})

export enum Events {
  NEW_MESSAGE = 'NEW_MESSAGE',
  DELETED_MESSAGE = 'DELETED_MESSAGE',
  NEW_PARTICIPANT = 'NEW_PARTICIPANT',
  DELETED_PARTICIPANT = 'DELETED_PARTICIPANT',
  NEW_MEMBER = 'NEW_MEMBER',
  DELETED_MEMBER = 'DELETED_MEMBER',
  NEW_CHANNEL = 'NEW_CHANNEL',
  DELETED_CHANNEL = 'DELETED_CHANNEL',
  TYPING = 'TYPING',
  NEW_VOICE_SESSION = 'NEW_VOICE_SESSION',
  ACCPETED_VOICE_SESSION = 'ACCPETED_VOICE_SESSION'
}

export enum ChannelTypes {
  PrivateChannel,
  GroupChannel,
  CommunityChannel
}
