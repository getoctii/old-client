import { faCogs } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './Products.module.scss'
import Button from '../../components/Button'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { getCommunity, getProducts } from '../remote'
import { Auth } from '../../authentication/state'
import Header from '../../components/Header'
import List from '../../components/List'
import Icon from '../../user/Icon'
import { faPlusCircle, faCubes } from '@fortawesome/pro-duotone-svg-icons'
import { useMedia } from 'react-use'
import { UI } from '../../state/ui'
import { ModalTypes } from '../../utils/constants'

// const products = [
//   {
//     id: 'points',
//     name: 'Points',
//     icon: 'https://file.coffee/u/fGpSBEutgA.png'
//   },
//   {
//     id: 'booooot',
//     name: 'innnnnbot',
//     icon: 'https://file.coffee/u/fGpSBEutgA.png'
//   }
// ]

const Products = () => {
  const ui = UI.useContainer()
  const history = useHistory()
  const { token } = Auth.useContainer()
  const { id } = useParams<{ id: string }>()
  const { data: community } = useQuery(['community', id, token], getCommunity)
  const { data: products } = useQuery(['products', id, token], getProducts)
  const isMobile = useMedia('(max-width: 740px)')

  return (
    <div className={styles.products}>
      <div className={styles.header}>
        <Header
          heading={'Products'}
          subheading={community?.name ?? ''}
          image={community?.icon}
        />
        {(products?.length ?? 0) > 0 && (
          <Button className={styles.newButton} type='button'>
            {isMobile ? (
              <FontAwesomeIcon icon={faPlusCircle} />
            ) : (
              'Create Product'
            )}
          </Button>
        )}
      </div>
      <br />
      <List.View>
        {(products?.length ?? 0) > 0 ? (
          products?.map(
            (product) =>
              product && (
                <List.Card
                  key={product.id}
                  title={product.name}
                  icon={<Icon avatar={product.icon} />}
                  actions={
                    <Button
                      type={'button'}
                      onClick={() => {
                        history.push(`/communities/${id}/products/sex`)
                      }}
                    >
                      <FontAwesomeIcon icon={faCogs} />
                    </Button>
                  }
                />
              )
          )
        ) : (
          <List.Empty
            title={'Get started with a new product!'}
            description={
              'Products allow you to create themes, client, and server side integerations, that can be listed on the Octii store.'
            }
            icon={faCubes}
            action={
              <Button
                type='button'
                onClick={() => ui.setModal({ name: ModalTypes.NEW_PRODUCT })}
              >
                Create Product <FontAwesomeIcon icon={faPlusCircle} />
              </Button>
            }
          />
        )}
      </List.View>
    </div>
  )
}

export default Products
