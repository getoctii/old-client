import axios from 'axios'

export const CLIENT_GATEWAY_URL = 'http://pornstash.innatical.com:8080'
export const clientGateway = axios.create({
  baseURL: CLIENT_GATEWAY_URL
})
