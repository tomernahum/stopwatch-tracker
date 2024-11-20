import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './lib/App.tsx'

import "@fontsource/noto-mono" 
import "@fontsource/ibm-plex-mono" 
import '@fontsource-variable/inter';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
