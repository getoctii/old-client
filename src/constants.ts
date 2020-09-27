import axios from 'axios'

export const CLIENT_GATEWAY_URL = 'https://api.chat.innatical.com'
export const clientGateway = axios.create({
  baseURL: CLIENT_GATEWAY_URL
})
