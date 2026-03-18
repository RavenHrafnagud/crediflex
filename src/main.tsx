import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { GlobalStyles } from './app/GlobalStyles'

// Application bootstrap for the CrediFlex promotions viewer.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalStyles />
    <App />
  </StrictMode>,
)
