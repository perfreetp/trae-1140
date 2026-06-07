import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import WorkBoard from '@/pages/WorkBoard'
import Catalog from '@/pages/Catalog'
import Inventory from '@/pages/Inventory'
import Requisition from '@/pages/Requisition'
import Transfer from '@/pages/Transfer'
import Recovery from '@/pages/Recovery'
import Analytics from '@/pages/Analytics'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/workboard" replace />} />
          <Route path="/workboard" element={<WorkBoard />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/requisition" element={<Requisition />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </Router>
  )
}
