import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './lib/App.tsx'

// TODO put in index.css so you don't get flash of unstyled fonts wating for js to run (i think that would wourk)
import "@fontsource/noto-mono" 
import '@fontsource-variable/inter';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
