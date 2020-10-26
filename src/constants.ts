import axios from 'axios'

export const CLIENT_GATEWAY_URL = 'https://gateway.octii.chat'
export const clientGateway = axios.create({
  baseURL: CLIENT_GATEWAY_URL
})
