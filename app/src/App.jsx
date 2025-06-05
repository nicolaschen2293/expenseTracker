import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ExpenseListPage from './pages/ExpenseListPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/expenses" element={<ExpenseListPage />} />
    </Routes>
  )
}

export default App