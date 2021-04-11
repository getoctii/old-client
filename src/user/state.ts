import { useQuery } from 'react-query'
import { Auth } from '../authentication/state'
import { getUser } from './remote'

export const useUser = (userID?: string) => {
  const { token } = Auth.useContainer()
  const { data: user } = useQuery(
    ['user', userID, token],
    async () => getUser('user', userID!, token!),
    {
      enabled: !!token && !!userID
    }
  )

  return user
}
