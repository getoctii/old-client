import {
  faCubes,
  faPaintBrush,
  faServer,
  faWindowMaximize
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, Suspense } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { Auth } from '../../../../authentication/state'
import List from '../../../../components/List'
import { getResource, getResources, ResourceTypes } from '../../../remote'
import styles from './Resources.module.scss'

const ProductCard: FC<{ id: string }> = ({ id }) => {
  const { productID } = useParams<{ productID: string }>()
  const auth = Auth.useContainer()
  const { data: resource } = useQuery(
    ['resource', productID, id, auth.token],
    getResource
  )
  return (
    <List.Card
      title={resource?.name}
      icon={
        <div
          className={`${styles.icon} ${
            resource?.type === ResourceTypes.THEME
              ? styles.warning
              : ResourceTypes.CLIENT_INTEGRATION
              ? styles.primary
              : styles.secondary
          }`}
        >
          {resource?.type === ResourceTypes.THEME ? (
            <FontAwesomeIcon icon={faPaintBrush} />
          ) : resource?.type === ResourceTypes.CLIENT_INTEGRATION ? (
            <FontAwesomeIcon icon={faWindowMaximize} />
          ) : (
            <FontAwesomeIcon icon={faServer} />
          )}
        </div>
      }
    />
  )
}

const Resources: FC = () => {
  const auth = Auth.useContainer()
  const { productID } = useParams<{ productID: string }>()
  const { data: resources } = useQuery(
    ['resources', productID, auth.token],
    getResources
  )
  return (
    <div className={styles.resources}>
      <List.View>
        {(resources?.length ?? 0) > 0 ? (
          resources?.map((resource) => (
            <Suspense key={resource} fallback={<List.CardPlaceholder />}>
              <ProductCard id={resource} />
            </Suspense>
          ))
        ) : (
          <List.Empty
            title={'No resources found'}
            description={'Create a new resource!'}
            icon={faCubes}
          />
        )}
      </List.View>
    </div>
  )
}

export default Resources
