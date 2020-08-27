import { isUsername } from '../../authentication/forms/validations'

export const isDiscriminator = (discriminator: string) => {
  if (discriminator === 'inn') return true
  const num = parseInt(discriminator)
  return num <= 9999 && num >= 0
}

export const isTag = (tag: string) => {
  const splitted = tag.split('#')
  return (
    splitted.length === 2 &&
    isUsername(splitted[0]) &&
    isDiscriminator(splitted[1])
  )
}
