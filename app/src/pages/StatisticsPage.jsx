import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line, ResponsiveContainer
} from 'recharts';

function StatisticsPage() {
  const [expenses, setExpenses] = useState([]);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkToken() {
      setToken(await getToken());
    }

    checkToken();
  }, [])

  useEffect(() => {
    if (token) fetchExpenses();
  }, [token]);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }

  async function fetchExpenses() {
    const res = await fetch("/api/getExpenses", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setExpenses(data);
  }

  const back = () => {
    navigate('/expenses');
  }

  const dailyExpenses = useMemo(() => {
    const grouped = {};

    expenses.forEach(exp => {
      const date = new Date(exp.date).toISOString().split('T')[0]; // YYYY-MM-DD
      if (!grouped[date]) grouped[date] = 0;
      grouped[date] += exp.amount;
    });

    // Convert to array and sort by date
    return Object.entries(grouped)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [expenses]);

  // Bar chart data (by expense title)
  const chartData = expenses.map(expense => ({
    title: expense.title,
    amount: expense.amount,
  }));

  // Pie chart data (grouped by category)
  const categoryMap = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6666', '#A28FD0'];

  return (
    <div className='flex flex-col items-center min-h-screen content-center gap-8 justify-center text-blue-500 p-4'>
      <h1 className='text-xl font-semibold'>Statistics</h1>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dailyExpenses} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      {/* Pie Chart */}
      <div>
        <h2 className='text-lg mb-2 mt-4 self-center'>Expenses by Category</h2>
        <PieChart width={400} height={400}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={130}
            dataKey="value"
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      <button onClick={back} className='bg-gray-500 text-white'>Back</button>
    </div>
  );
}

export default StatisticsPage;