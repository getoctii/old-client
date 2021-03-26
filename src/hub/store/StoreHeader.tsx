import { faChevronCircleRight } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Suspense, useState } from 'react'
import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { useDebounce } from 'react-use'
import { Auth } from '../../authentication/state'
import { getProduct } from '../../community/remote'
import Input from '../../components/Input'
import Icon from '../../user/Icon'
import { clientGateway } from '../../utils/constants'
import styles from './StoreHeader.module.scss'

const ProductCard = ({ id }: { id: string }) => {
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

const SearchCard = ({ search }: { search: string }) => {
  const auth = Auth.useContainer()
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useDebounce(() => setDebouncedSearch(search), 300, [search])
  const { data: products } = useQuery<string[]>(
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
      {products?.map((product) => (
        <Suspense fallback={<></>}>
          <ProductCard id={product} />
        </Suspense>
      ))}
    </div>
  )
}

const StoreHeader = () => {
  const [searchQuery, setSearchQuery] = useState<string>()
  return (
    <div className={styles.header}>
      <h1>Welcome to the store!</h1>
      <h2>Level up your experience with extensions</h2>
      <Input
        placeholder='Find integrations and themes...'
        onChange={(event) => setSearchQuery(event.target.value)}
      />
      <Suspense fallback={<div></div>}>
        {searchQuery && searchQuery !== '' && (
          <SearchCard search={searchQuery} />
        )}
      </Suspense>
    </div>
  )
}

export default StoreHeader
