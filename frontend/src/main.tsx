import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import { BrowserRouter } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={ruRU}
      theme={{
        token: {
          fontFamily: "'Montserrat', sans-serif",
          colorPrimary: '#0044cc',
          borderRadius: 8,
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
)
