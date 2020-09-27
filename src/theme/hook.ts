import { createContainer } from 'unstated-next'
import { useEffect } from 'react'
import { useLocalStorage } from 'react-use'
import darkTheme from './themes/default-dark.json'

interface Theme {
  id: string
  name: string
  background: string
  foreground: string
  primary: string
  secondary: string
  textInline: string
  text: string
  danger: string
  overground: string
  messageHover: string
  global?: string
}

const globalStyle = document.createElement('style')
globalStyle.type = 'text/css'
document.head.appendChild(globalStyle)

const useTheme = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', darkTheme)
  useEffect(() => {
    if (!theme) return
    const documentStyle = document.documentElement.style
    documentStyle.setProperty('--neko-background', theme.background)
    documentStyle.setProperty('--neko-foreground', theme.foreground)
    documentStyle.setProperty('--neko-text-inline', theme.textInline)
    documentStyle.setProperty('--neko-primary', theme.primary)
    documentStyle.setProperty('--neko-secondary', theme.secondary)
    documentStyle.setProperty('--neko-text', theme.text)
    documentStyle.setProperty('--neko-danger', theme.danger)
    documentStyle.setProperty('--neko-overground', theme.overground)
    documentStyle.setProperty('--neko-message-hover', theme.messageHover)
    globalStyle.textContent = theme.global ?? ''
  }, [theme])
  return { theme, setTheme }
}

export default createContainer(useTheme)
