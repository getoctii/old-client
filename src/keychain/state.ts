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
import { UI } from '../state/ui'
import { ModalTypes } from '../utils/constants'
import { useSuspenseStorageItem } from '../utils/storage'

const useKeychain = () => {
  const { id, token } = Auth.useContainer()
  const [keychainPassword, setKeychainPassword] = useSuspenseStorageItem<
    string | null
  >('keychainPassword', null)
  const [keychain, setKeychain] = useState<types.Keychain | null>(null)
  const { data } = useQuery(['keychain', id, token], getKeychain)
  const { setModal } = UI.useContainer()
  const hasKeychain = useMemo(() => !!data, [data])
  const decryptedKeychain = useMemo(() => !!keychain, [keychain])
  const decryptKeychain = useCallback(
    async (password: string) => {
      if (!data) {
        throw Error('NoKeychainPresent')
      }
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

  useEffect(() => {
    setKeychain(null)
  }, [data])

  useEffect(() => {
    if (!(data && !keychain)) return
    if (keychainPassword === undefined) return
    if (keychainPassword) {
      try {
        decryptKeychain(keychainPassword)
      } catch {
        setModal({ name: ModalTypes.DECRYPT_KEYCHAIN })
      }
    } else {
      setModal({ name: ModalTypes.DECRYPT_KEYCHAIN })
    }
  }, [
    data,
    keychain,
    setModal,
    keychainPassword,
    setKeychainPassword,
    decryptKeychain
  ])

  console.log(keychainPassword)

  return {
    decryptKeychain,
    decryptedKeychain,
    hasKeychain,
    keychain,
    setKeychainPassword
  }
}

export const Keychain = createContainer(useKeychain)
