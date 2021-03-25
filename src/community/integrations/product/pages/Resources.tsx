import {
  faCubes,
  faPaintBrushAlt,
  faServer,
  faWindow
} from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import List from '../../../../components/List'
import styles from './Resources.module.scss'

enum ResourceType {
  THEME,
  INTEGRATION,
  CLIENT_INTEGERATION
}

// idk i spelled integerations wrong somewhere

const resources = [
  {
    id: 'Hot Pink uwu',
    name: 'Hot Pink uwu',
    type: ResourceType.THEME
  },
  {
    id: 'Pornhub Stats',
    name: 'Pornhub Stats',
    type: ResourceType.INTEGRATION
  },
  {
    id: 'OnlyFans Browser',
    name: 'OnlyFans Browser',
    type: ResourceType.CLIENT_INTEGERATION
  }
]

const Resources = () => {
  return (
    <div className={styles.resources}>
      <List.View>
        {resources.length > 0 ? (
          resources.map((resource) => (
            <List.Card
              key={resource.id}
              title={resource.name}
              icon={
                <div
                  className={`${styles.icon} ${
                    resource.type === ResourceType.THEME
                      ? styles.warning
                      : ResourceType.CLIENT_INTEGERATION
                      ? styles.primary
                      : styles.secondary
                  }`}
                >
                  {resource.type === ResourceType.THEME ? (
                    <FontAwesomeIcon icon={faPaintBrushAlt} />
                  ) : resource.type === ResourceType.CLIENT_INTEGERATION ? (
                    <FontAwesomeIcon icon={faWindow} />
                  ) : (
                    <FontAwesomeIcon icon={faServer} />
                  )}
                </div>
              }
            />
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
