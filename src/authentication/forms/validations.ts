export const isEmail = (value: string) => (
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    .test(value)
  && value.length <= 128
  && value.length >= 3
)

export const isPassword = (value: string) => (
  value.length >= 8
  && value.length <= 256
)

export const isUsername = (value: string) => (
  /^[a-zA-Z]+$/
    .test(value)
  && value.length <= 16
  && value.length >= 3
)
