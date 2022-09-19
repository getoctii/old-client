import StoreHeader from './StoreHeader'
import Featured from './Featured'
import styles from './Store.module.scss'
import { useMedia } from 'react-use'
import Header from '../../components/Header'
import { useHistory } from 'react-router-dom'
import { FC } from 'react'

const Store: FC = () => {
  const isMobile = useMedia('(max-width: 740px)')
  const history = useHistory()
  return (
    <div className={styles.store}>
      {isMobile && (
        <>
          <Header
            heading='Store'
            subheading='Hub'
            onBack={() => history.push('/hub')}
          />
          <br />
        </>
      )}
      <StoreHeader />
      <Featured />
    </div>
  )
}

export default Store
