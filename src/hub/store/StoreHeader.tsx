import { faChevronCircleRight } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Suspense, useState, FC } from 'react'
import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { useDebounce } from 'react-use'
import { Auth } from '../../authentication/state'
import { getProduct } from '../../community/remote'
import Input from '../../components/Input'
import Icon from '../../user/Icon'
import { clientGateway } from '../../utils/constants'
import styles from './StoreHeader.module.scss'

const ProductCard: FC<{ id: string }> = ({ id }) => {
  const auth = Auth.useContainer()
  const history = useHistory()
  const { data: product } = useQuery(['product', id, auth.token], getProduct)
  return (
    <div
      className={styles.productCard}
      onClick={() => history.push(`/hub/store/${id}`)}
    >
      <Icon avatar={product?.icon} />
      <h3>{product?.name}</h3>
      <FontAwesomeIcon icon={faChevronCircleRight} />
    </div>
  )
}

const SearchCard: FC<{ search: string }> = ({ search }) => {
  const auth = Auth.useContainer()
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useDebounce(() => setDebouncedSearch(search), 300, [search])
  const { data: products, isLoading } = useQuery<string[]>(
    ['productSearch', debouncedSearch, auth.token],
    async () =>
      (
        await clientGateway.get('/products/search', {
          headers: {
            Authorization: auth.token
          },
          params: {
            query: debouncedSearch
          }
        })
      ).data
  )

  return (
    <div className={styles.results}>
      {isLoading ? (
        'Loading'
      ) : (products?.length ?? 0) > 0 ? (
        products?.map((product) => (
          <Suspense
            fallback={
              <div className={styles.productCardPlaceholder}>
                <div className={styles.icon} />
                <div className={styles.name} />
              </div>
            }
          >
            <ProductCard id={product} />
          </Suspense>
        ))
      ) : (
        <div className={styles.noResults}>
          <h3>Couldn't find anything containing "{debouncedSearch}"</h3>
        </div>
      )}
    </div>
  )
}

const StoreHeader: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>()
  return (
    <div className={styles.header}>
      <h1>Welcome to the store!</h1>
      <h2>Level up your experience with extensions</h2>
      <Input
        placeholder='Find integrations and themes...'
        onChange={(event) => setSearchQuery(event.target.value)}
      />
      <Suspense fallback={<div className={styles.results}>Loading...</div>}>
        {searchQuery && searchQuery !== '' && (
          <SearchCard search={searchQuery} />
        )}
      </Suspense>
    </div>
  )
}

export default StoreHeader
