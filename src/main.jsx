import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Layout from './Layout.jsx'
import Introduction  from './Introduction.jsx'
import { BrowserRouter, Routes, Route } from 'react-router'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route path='/' element={<App />}></Route>
          <Route path='/introduction' element={<Introduction />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
