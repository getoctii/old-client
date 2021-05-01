import { useHistory } from 'react-router-dom'
import { Auth } from '../authentication/state'
import styles from './Navbar.module.scss'
import { useUser } from '../user/state'
import { FC } from 'react'

const Navbar: FC = () => {
  const history = useHistory()
  const auth = Auth.useContainer()
  const user = useUser(auth.id ?? undefined)

  return (
    <div className={styles.navbar}>
      <div className={styles.marketing}>
        <picture>
          <img alt='Octii' src='/logo.svg' />
        </picture>
      </div>
      <h1 onClick={() => history.push('/home')}>Octii</h1>
      <button onClick={() => history.push('/authenticate/login')}>
        {user?.username ?? 'Login'}
      </button>
    </div>
  )
}

export default Navbar
