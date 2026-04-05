import { Routes, Route } from 'react-router-dom'
import PortalPage from './pages/PortalPage'
import GridPage from './pages/GridPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PortalPage />} />
      <Route path="/grid" element={<GridPage />} />
    </Routes>
  )
}
