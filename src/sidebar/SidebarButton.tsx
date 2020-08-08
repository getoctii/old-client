import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import styles from './SidebarButton.module.scss'

export const SidebarButton = ({ icon }: { icon: IconProp }) => {
  return (
    <button className={styles.button} type='button'>
      <FontAwesomeIcon icon={icon} size='2x' />
    </button>
  )
}
