export const log = (type: string, color: string, message: string) => {
  console.log(
    `%c${type}%c${message}`,
    `background-color: ${color}; border-radius: 5px; padding: 5px; line-height: 25px; margin-right: 10px; font-weight: 700;`,
    'background-color: none; border-radius: 0px; padding: 0px; font-weight: initial;'
  )
}
