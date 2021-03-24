import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Suspense } from 'react'
import { UI } from '../../state/ui'
import { ModalTypes } from '../../utils/constants'
import OrganizationCard from './OrganizationCard'
import styles from './Organizations.module.scss'

const organizations = [
  {
    id: 'shit'
  }
]

const Organizations = () => {
  const ui = UI.useContainer()
  return (
    <>
      <div className={styles.organizations}>
        <h4>
          Organizations{' '}
          <span>
            <FontAwesomeIcon
              className={styles.add}
              icon={faPlus}
              onClick={() => ui.setModal({ name: ModalTypes.ADD_FRIEND })}
            />
          </span>
        </h4>

        <div className={styles.list}>
          {(organizations?.length ?? 0) > 0 ? (
            organizations?.map((organization, index) => (
              <>
                {index !== 0 && <hr />}
                <Suspense
                  key={organization.id}
                  fallback={<OrganizationCard.Placeholder />}
                >
                  <OrganizationCard.View id={organization.id} />
                </Suspense>
              </>
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  )
}

export default Organizations
