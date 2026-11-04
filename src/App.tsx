import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@components/Layout'
import DashboardPage from './pages/DashboardPage'
import OperationsPage from './pages/OperationsPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App