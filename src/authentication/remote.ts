import { clientGateway } from '../constants'

type LoginResponse = {
  authorization: string
}

export const login = async (values: { email: string, password: string }) =>
  (await clientGateway.post<LoginResponse>('/users/login', new URLSearchParams(values))).data

type RegisterResponse = {
  authorization: string
}

export const register = async (values: { email: string, username: string, password: string }) =>
  (await clientGateway.post<RegisterResponse>('/users', new URLSearchParams(values))).data
