import { clientGateway } from '../utils/constants'

type LoginResponse = {
  authorization: string
}

export const login = async (values: { email: string; password: string }) =>
  (await clientGateway.post<LoginResponse>('/users/login', values)).data

type RegisterResponse = {
  authorization: string
}

export const register = async (values: {
  email: string
  username: string
  password: string
  betaCode: string
}) => (await clientGateway.post<RegisterResponse>('/users', values)).data
