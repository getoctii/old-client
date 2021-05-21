import { clientGateway } from '../utils/constants'
import {
  arrayBufferToString,
  arrayToArrayBuffer,
  deriveBitsFromPassword
} from '@innatical/inncryption/dist/util'
import {
  createProtectedKeychain,
  exportProtectedKeychain,
  generateKeychain
} from '@innatical/inncryption'

type LoginResponse = {
  authorization: string
}

export const login = async (
  values: { email: string; password: string },
  promptForCode: () => Promise<string>
) => {
  const {
    data: { tokenSalt, totp }
  } = await clientGateway.get<{ tokenSalt?: number[]; totp: boolean }>(
    `/users/login?email=${values.email}`
  )

  const code = totp ? await promptForCode() : undefined

  if (tokenSalt) {
    const password = arrayBufferToString(
      await deriveBitsFromPassword(
        values.password,
        arrayToArrayBuffer(tokenSalt)
      )
    )
    return (
      await clientGateway.post<LoginResponse>('/users/login', {
        ...values,
        password,
        code
      })
    ).data
  } else {
    return (
      await clientGateway.post<LoginResponse>('/users/login', {
        ...values,
        code
      })
    ).data
  }
}

type RegisterResponse = {
  authorization: string
}

export const register = async (values: {
  email: string
  username: string
  password: string
  betaCode: string
}) => {
  const keychain = await generateKeychain(values.password)
  const protectedKeychain = exportProtectedKeychain(
    await createProtectedKeychain(keychain, values.password)
  )
  return (
    await clientGateway.post<RegisterResponse>('/users', {
      ...values,
      keychain: protectedKeychain,
      password: keychain.authenticationToken
    })
  ).data
}
