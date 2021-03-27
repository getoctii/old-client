import { IconDefinition } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ReactNode } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import styles from './Sideview.module.scss'

const Sideview = ({
  name,
  tabs,
  children
}: {
  name: string
  tabs: {
    name: string
    icon: IconDefinition
    color: string
    link: string
  }[]
  children?: ReactNode
}) => {
  const history = useHistory()
  const match = useRouteMatch<{ page: string }>('/:tab/:page')

  return (
    <div className={styles.sideview}>
      <h2>{name}</h2>
      <div className={styles.list}>
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`${styles.tab} ${
              tab.color === 'primary'
                ? styles.primary
                : tab.color === 'secondary'
                ? styles.secondary
                : tab.color === 'danger'
                ? styles.danger
                : styles.warning
            } ${
              match?.params.page === tab.name.toLowerCase()
                ? styles.selected
                : ''
            }`}
            onClick={() => history.push(tab.link)}
          >
            <div className={styles.icon}>
              <FontAwesomeIcon icon={tab.icon} fixedWidth />
            </div>
            {tab.name}
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}

export default Sideview
