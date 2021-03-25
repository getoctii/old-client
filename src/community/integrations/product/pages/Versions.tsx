import { faCodeCommit } from '@fortawesome/pro-duotone-svg-icons'
import React from 'react'
import List from '../../../../components/List'
import styles from './Versions.module.scss'

const versions = [
  {
    id: 'ur mom',
    version: '6.9.420'
  }
]

const Versions = () => {
  return (
    <div className={styles.versions}>
      <List.View>
        {versions.length > 0 ? (
          versions.map((version) => (
            <List.Card key={version.id} title={version.version} />
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
