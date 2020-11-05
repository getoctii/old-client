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
  DELETE_MEMBER = 'DELETE_MEMBER',
  NEW_CHANNEL = 'NEW_CHANNEL',
  DELETE_CHANNEL = 'DELETE_CHANNEL',
  TYPING = 'TYPING'
}
