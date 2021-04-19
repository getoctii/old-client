import { faCodeCommit } from '@fortawesome/pro-duotone-svg-icons'
import { Suspense, FC } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { Auth } from '../../../../authentication/state'
import List from '../../../../components/List'
import { getVersion, getVersions } from '../../../remote'
import styles from './Versions.module.scss'

const VersionCard: FC<{ id: number }> = ({ id }) => {
  const { productID } = useParams<{ productID: string }>()
  const auth = Auth.useContainer()
  const { data: version } = useQuery(
    ['version', productID, id, auth.token],
    getVersion
  )
  return (
    <List.Card title={version?.name} subtitle={`Build: ${version?.number}`} />
  )
}

const Versions: FC = () => {
  const auth = Auth.useContainer()
  const { productID } = useParams<{ productID: string }>()
  const { data: versions } = useQuery(
    ['versions', productID, auth.token],
    getVersions
  )
  return (
    <div className={styles.versions}>
      <List.View>
        {(versions?.length ?? 0) > 0 ? (
          versions?.map((version) => (
            <Suspense key={version} fallback={<List.CardPlaceholder />}>
              <VersionCard id={version} />
            </Suspense>
          ))
        ) : (
          <List.Empty
            title={'No versions found'}
            description={'Create a new version!'}
            icon={faCodeCommit}
          />
        )}
      </List.View>
    </div>
  )
}

export default Versions
