import { createContainer } from '@innatical/innstate'
import { useQuery } from 'react-query'
import { getKeychain } from '../user/remote'
import { Auth } from '../authentication/state'
import { useMemo } from 'react'

const useKeychain = () => {
  const { id, token } = Auth.useContainer()
  const { data } = useQuery(['keychain', id, token], getKeychain)

  const hasKeychain = useMemo(() => !!data, [data])

  return {
    hasKeychain
  }
}

export const Keychain = createContainer(useKeychain)
