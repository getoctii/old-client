import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { createContainer } from 'unstated-next'
import { Auth } from '../authentication/state'
import { getPurchases } from '../user/remote'
import {
  Plugins,
  FilesystemDirectory,
  FilesystemEncoding
} from '@capacitor/core'
import { clientGateway } from '../utils/constants'
import { ThemeBundle } from '../theme/hook'

const { Filesystem } = Plugins

const exists = async (path: string, directory: FilesystemDirectory) => {
  try {
    await Filesystem.stat({
      path,
      directory
    })
    return true
  } catch {
    return false
  }
}

const getPayloads = async (
  _: unknown,
  payloadKeys: [string, number][],
  token: string
) => {
  return await Promise.all(
    payloadKeys.map(async (key) => {
      if (
        await exists(
          `payloads/${key[0]}/${key[1]}.json`,
          FilesystemDirectory.Data
        )
      ) {
        return JSON.parse(
          (
            await Filesystem.readFile({
              path: `payloads/${key[0]}/${key[1]}.json`,
              directory: FilesystemDirectory.Data,
              encoding: FilesystemEncoding.UTF8
            })
          ).data
        )
      } else {
        const { data } = await clientGateway.get<{
          server: any[]
          themes: ThemeBundle[]
          client: any[]
        }>(`/products/${key[0]}/versions/${key[1]}/payload`, {
          headers: {
            Authorization: token
          }
        })
        await Filesystem.writeFile({
          path: `payloads/${key[0]}/${key[1]}.json`,
          directory: FilesystemDirectory.Data,
          data: JSON.stringify(data),
          encoding: FilesystemEncoding.UTF8,
          recursive: true
        })

        return data
      }
    })
  )
}

const useIntegrations = () => {
  const auth = Auth.useContainer()
  const { data: purchases } = useQuery(
    ['purchases', auth.id, auth.token],
    getPurchases,
    {
      enabled: auth.authenticated
    }
  )

  const payloadKeys = useMemo(
    () =>
      (purchases ?? [])
        ?.filter((purchase) => !!purchase.latest_version)
        .map((purchase) => [purchase.id, purchase.latest_version]),
    [purchases]
  )

  const { data: payloads } = useQuery<
    {
      server: any[]
      themes: ThemeBundle[]
      client: any[]
    }[]
  >(['payloads', payloadKeys, auth.token], getPayloads, {
    enabled: auth.authenticated
  })

  return {
    payloads
  }
}

export default createContainer(useIntegrations)
