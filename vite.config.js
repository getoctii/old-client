import reactRefresh from '@vitejs/plugin-react-refresh'

const config = {
  plugins: [reactRefresh()],
  esbuild: {
    jsxInject: `import React from 'react'`
  }
}

export default config
