import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Auth } from '../authentication/state'
import { getUser } from '../user/remote'
import styles from './Navbar.module.scss'

const Navbar = () => {
  const history = useHistory()
  const auth = Auth.useContainer()

  const { data: user } = useQuery(['users', auth.id, auth.token], getUser, {
    enabled: !!auth.authenticated
  })

  return (
    <div className={styles.navbar}>
      <h1 onClick={() => history.push('/home')}>Octii</h1>
      <button onClick={() => history.push('/authenticate/login')}>
        {user?.username ?? 'Login'}
      </button>
    </div>
  )
}

export default Navbar
