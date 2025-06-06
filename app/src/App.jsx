import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ExpenseListPage from './pages/ExpenseListPage'
import StatisticsPage from './pages/StatisticsPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/expenses" element={<ExpenseListPage />} />
      <Route path="/statistics" element={<StatisticsPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  )
}

export default App