import React from 'react'
import styles from './Sidebar.module.scss'
import { Auth } from '../authentication/state'
import { useQuery } from 'react-query'
import { clientGateway } from '../constants'
import { SidebarButton } from './SidebarButton'
import { faUserFriends, faPlus } from '@fortawesome/pro-solid-svg-icons'
type RegisterResponse = {
  avatar: string
}

export const Sidebar = () => {
  const auth = Auth.useContainer()
  console.log(auth.id)
  const user = useQuery('user', async () => (await clientGateway.get<RegisterResponse>(`/users/${auth.id}`, {
    headers: {
      Authorization: auth.token
    }
  })).data)
  return (
    <div className={styles.sidebar}>
      <button>
        <img className={styles.avatar} src={user.data?.avatar} />
      </button>
      <SidebarButton icon={faUserFriends} />
      <SidebarButton icon={faPlus} />
    </div>
  )
}
