import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import styles from './SidebarButton.module.scss'

export const SidebarButton = ({ icon, color, onClick }: { icon: IconProp, color: string, onClick?: any }) => {
  return (
    <button className={`${styles.button} ${styles[color]}`} type='button' onClick={onClick}>
      <FontAwesomeIcon icon={icon} size='2x' />
    </button>
  )
}
