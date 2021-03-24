import { faBoxOpen } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { memo, Suspense } from 'react'
import styles from './Products.module.scss'

const products = [
  {
    id: 'points',
    name: 'Points',
    icon: 'https://file.coffee/u/fGpSBEutgA.png'
  },
  {
    id: 'booooot',
    name: 'innnnnbot',
    icon: 'https://file.coffee/u/fGpSBEutgA.png'
  }
]

const ProductCard = memo(() => {
  return (
    <div className={styles.product}>
      <div className={styles.info}>
        <h4>sex</h4>
      </div>
    </div>
  )
})

const Products = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.products}>
        {products.length > 0 ? (
          <>
            <div className={styles.body}>
              {products.map(
                (member) =>
                  member && (
                    <Suspense fallback={<></>}>
                      <ProductCard />
                    </Suspense>
                  )
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.productsEmpty}>
              <FontAwesomeIcon size={'5x'} icon={faBoxOpen} />
              <br />
              <h2>No products in this organization!</h2>
              <br />
              <br />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Products
