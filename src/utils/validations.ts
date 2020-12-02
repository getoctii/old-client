export const isDiscriminator = (discriminator: string) => {
  if (!discriminator) return false
  if (discriminator === 'inn') return true
  const num = parseInt(discriminator)
  return num <= 9999 && num >= 0
}

export const isTag = (tag: string) => {
  if (!tag) return true
  const splitted = tag.split('#')
  return (
    splitted.length === 2 &&
    isUsername(splitted[0]) &&
    isDiscriminator(splitted[1])
  )
}

export const isEmail = (value: string) =>
  !value ||
  (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    value
  ) &&
    value.length <= 128 &&
    value.length >= 3)

export const isPassword = (value: string) =>
  !value || (value.length >= 8 && value.length <= 256)

export const isUsername = (value: string) =>
  !value ||
  (/^[a-zA-Z ]+$/.test(value) && value.length <= 16 && value.length >= 3)

export const isInvite = (value: string) =>
  !value || /^[a-zA-Z0-9_-]+$/.test(value)
