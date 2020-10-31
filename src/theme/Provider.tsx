import { ThemeProvider } from 'emotion-theming'
import React from 'react'
import Themes from './hook'

const Provider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = Themes.useContainer()
  return <ThemeProvider theme={theme || {}}>{children}</ThemeProvider>
}

export default Provider
