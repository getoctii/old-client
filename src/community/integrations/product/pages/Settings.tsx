import { Formik, Form, ErrorMessage, Field } from 'formik'
import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { Auth } from '../../../../authentication/state'
import Button from '../../../../components/Button'
import Input from '../../../../components/Input'
import { clientGateway } from '../../../../utils/constants'
import { isUsername } from '../../../../utils/validations'
import styles from './Settings.module.scss'
import { CommunityResponse, getCommunity, getProduct } from '../../../remote'
import IconPicker from '../../../../components/IconPicker'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/pro-duotone-svg-icons'
import * as Yup from 'yup'

const DeleteSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too short, must be at least 2 characters.')
    .max(16, 'Too long, must be less then 16 characters.')
    .optional()
})

const Personalization = () => {
  const { productID } = useParams<{ productID: string }>()
  const auth = Auth.useContainer()
  const [saveTagline, setSaveTagline] = useState<string | undefined>(undefined)
  const [saveName, setSaveName] = useState<string | undefined>(undefined)
  const [saveDescription, setSaveDescription] = useState<string | undefined>(
    undefined
  )
  const { data: product } = useQuery(
    ['product', productID, auth.token],
    getProduct
  )
  return (
    <div className={styles.card}>
      <h5>Personalization</h5>
      <div className={styles.personalization}>
        <div className={styles.images}>
          <div className={styles.icon}>
            <label htmlFor='icon' className={styles.inputName}>
              Icon
            </label>
            <IconPicker
              alt={product?.name || 'unknown'}
              defaultIcon={product?.icon}
              onUpload={async (url) => {
                if (!auth.token) return
                await clientGateway.patch(
                  `/products/${productID}`,
                  {
                    icon: url
                  },
                  {
                    headers: {
                      Authorization: auth.token
                    }
                  }
                )
              }}
            />
          </div>
          <div className={styles.banner}>
            <label htmlFor='banner' className={styles.inputName}>
              Banner
            </label>
            <IconPicker
              alt={product?.banner || 'unknown'}
              defaultIcon={product?.banner}
              recommendedIcon={'Recommanded banner size is 1280x960'}
              onUpload={async (url) => {
                if (!auth.token) return
                await clientGateway.patch(
                  `/products/${productID}`,
                  {
                    banner: url
                  },
                  {
                    headers: {
                      Authorization: auth.token
                    }
                  }
                )
              }}
            />
          </div>
        </div>
        <div className={styles.name}>
          <label htmlFor='name' className={styles.inputName}>
            Name
          </label>
          <div className={styles.nameInput}>
            <Input
              onChange={(event) => {
                if (event.target.value !== '') {
                  setSaveName(event.target.value)
                }
              }}
              value={saveName}
              defaultValue={product?.name}
              onKeyDown={async (event) => {
                if (
                  event.key === 'Enter' &&
                  saveName &&
                  saveName !== '' &&
                  auth.token &&
                  isUsername(saveName)
                ) {
                  await clientGateway.patch(
                    `/products/${productID}`,
                    {
                      name: saveName
                    },
                    {
                      headers: {
                        Authorization: auth.token
                      }
                    }
                  )
                  setSaveName(undefined)
                }
              }}
            />
            {saveName && (
              <Button
                type='button'
                onClick={async () => {
                  if (
                    !saveName ||
                    saveName === '' ||
                    !auth.token ||
                    !isUsername(saveName)
                  )
                    return
                  await clientGateway.patch(
                    `/products/${productID}`,
                    {
                      name: saveName
                    },
                    {
                      headers: {
                        Authorization: auth.token
                      }
                    }
                  )
                  setSaveName(undefined)
                }}
              >
                <FontAwesomeIcon icon={faSave} />
              </Button>
            )}
          </div>
        </div>
        <ul>
          <li>- Must be 2-16 long</li>
          <li>- Can only be letters, numbers, dashes, and underscores.</li>
        </ul>
        <br />
        <div className={styles.name}>
          <label htmlFor='tagline' className={styles.inputName}>
            Tagline
          </label>
          <div className={styles.nameInput}>
            <Input
              onChange={(event) => {
                if (event.target.value !== '') {
                  setSaveTagline(event.target.value)
                }
              }}
              defaultValue={product?.tagline}
              value={saveTagline}
              onKeyDown={async (event) => {
                if (
                  event.key === 'Enter' &&
                  saveTagline &&
                  saveTagline !== '' &&
                  auth.token &&
                  isUsername(saveTagline)
                ) {
                  await clientGateway.patch(
                    `/products/${productID}`,
                    {
                      tagline: saveTagline
                    },
                    {
                      headers: {
                        Authorization: auth.token
                      }
                    }
                  )
                  setSaveTagline(undefined)
                }
              }}
            />
            {saveTagline && (
              <Button
                type='button'
                onClick={async () => {
                  if (
                    !saveTagline ||
                    saveTagline === '' ||
                    !auth.token ||
                    !isUsername(saveTagline)
                  )
                    return
                  await clientGateway.patch(
                    `/products/${productID}`,
                    {
                      tagline: saveTagline
                    },
                    {
                      headers: {
                        Authorization: auth.token
                      }
                    }
                  )
                  setSaveTagline(undefined)
                }}
              >
                <FontAwesomeIcon icon={faSave} />
              </Button>
            )}
          </div>
        </div>
        <div className={styles.description}>
          <label htmlFor='description' className={styles.inputName}>
            Description
          </label>
          <div className={styles.descriptionInput}>
            <textarea
              rows={5}
              onChange={(event) => {
                if (event.target.value !== '') {
                  setSaveDescription(event.target.value)
                }
              }}
              value={saveDescription}
              defaultValue={product?.description}
            />
            {saveDescription && (
              <Button
                type='button'
                onClick={async () => {
                  if (!saveDescription || saveDescription === '' || !auth.token)
                    return
                  await clientGateway.patch(
                    `/products/${productID}`,
                    {
                      description: saveDescription
                    },
                    {
                      headers: {
                        Authorization: auth.token
                      }
                    }
                  )
                  setSaveDescription(undefined)
                }}
              >
                <FontAwesomeIcon icon={faSave} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const DangerZone = ({ community }: { community: CommunityResponse }) => {
  const auth = Auth.useContainer()
  const history = useHistory()
  return (
    <div className={styles.dangerZone}>
      <div className={styles.delete}>
        <h4>Delete Product</h4>
        <p>
          Deleting a product will wipe it from the face of this planet. Do not
          do this as you will not be able to recover the product or any of it’s
          data including, communities it's in, store listing, users, and
          settings.{' '}
        </p>
        <Formik
          initialValues={{
            name: '',
            actualName: community.name
          }}
          validationSchema={DeleteSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await clientGateway.delete(`/communities/${community.id}`, {
                headers: { Authorization: auth.token }
              })
              history.push(`/`)
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <label htmlFor='name'>Name</label>
              <div className={styles.dangerWrapper}>
                <div className={styles.dangerInput}>
                  <Field component={Input} name='name' />
                  <ErrorMessage
                    className={styles.error}
                    component='p'
                    name='name'
                  />
                </div>
                <Button
                  className={styles.button}
                  disabled={isSubmitting}
                  type='submit'
                >
                  Delete Community
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export const Settings = () => {
  const auth = Auth.useContainer()
  const match = useRouteMatch<{ id: string }>('/communities/:id/products')
  const { data: community } = useQuery(
    ['community', match?.params.id, auth.token],
    getCommunity
  )
  return (
    <div className={styles.general}>
      <div className={styles.basics}>
        <Personalization />
      </div>
      {community?.owner_id === auth.id && <DangerZone community={community} />}
    </div>
  )
}
