import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { supabase } from '../utils/supabase.js'
import LandingPage from './pages/LandingPage'
import ExpenseListPage from './pages/ExpenseListPage'
import StatisticsPage from './pages/StatisticsPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

function App() {
  useEffect(() => {
  const handleFocus = async () => {
    const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking session on focus:', error);
      } else if (!data.session) {
        console.log('No session found – user might be logged out');
      } else {
        console.log('Session refreshed on tab focus');
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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