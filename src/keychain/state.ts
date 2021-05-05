import { createContainer } from '@innatical/innstate'
import { useQuery } from 'react-query'
import { getKeychain } from '../user/remote'
import { Auth } from '../authentication/state'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  importProtectedKeychain,
  unlockProtectedKeychain
} from '@innatical/inncryption'
import * as types from '@innatical/inncryption/dist/types'

const useKeychain = () => {
  const { id, token } = Auth.useContainer()
  const [keychain, setKeychain] = useState<types.Keychain | null>(null)
  const { data } = useQuery(['keychain', id, token], getKeychain)
  useEffect(() => {
    setKeychain(null)
  }, [data])

  const hasKeychain = useMemo(() => !!data, [data])
  const decryptedKeychain = useMemo(() => !!keychain, [keychain])
  const decryptKeychain = useCallback(
    async (password: string) => {
      if (!data) throw Error('NoKeychainPresent')
      const protectedKeychain = importProtectedKeychain(data)
      const keychain = await unlockProtectedKeychain(
        protectedKeychain,
        password
      )
      setKeychain(keychain)
      return keychain
    },
    [data]
  )

  return {
    decryptKeychain,
    decryptedKeychain,
    hasKeychain,
    keychain
  }
}

export const Keychain = createContainer(useKeychain)
