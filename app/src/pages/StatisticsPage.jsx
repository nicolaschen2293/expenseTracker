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
    const res = await fetch("/api/getExpenses?all=true&sorting=datedescending&", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setExpenses(data.data);
  }

  const back = () => {
    navigate('/expenses');
  }

  const dailyExpenses = useMemo(() => {
    const grouped = {};
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7); // includes today

    expenses.forEach(exp => {
      const dateObj = new Date(exp.date);
      const date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

      if (dateObj >= sevenDaysAgo && dateObj <= today) {
        if (!grouped[date]) grouped[date] = 0;
        grouped[date] += exp.amount;
      }
    });

    return Object.entries(grouped)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [expenses]);

  const monthlyExpenses = useMemo(() => {
    const result = {};

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g. "Jun 2025"

      if (!result[month]) {
        result[month] = 0;
      }

      result[month] += parseFloat(expense.amount);
    });

    return Object.entries(result).map(([month, total]) => ({
      month,
      total: parseFloat(total.toFixed(2)), // round for neatness
    })).sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [expenses])

  // Pie chart data (grouped by category)
  const categoryMap = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const COLORS = ['#ff0000', '#008000', '#ffff00', '#0000ff', '#800080', '#ffa500', '#00ffff', '#ffc0cb'];

  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      {/* Title */}
      <h1 className="text-xl font-extrabold text-center mb-4 text-blue-500">Statistics</h1>

      {/* Charts Container */}
      <div className="flex flex-row justify-start gap-8 flex-grow">
        {/* Line and Bar Charts */}
        <div className="flex flex-col w-[850px] gap-8 ml-8">
          {/* Line Chart */}
          <div className="h-[250px]">
            <h2 className="text-lg mb-2 text-center text-blue-500">Daily Expenses</h2>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyExpenses} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="h-[250px]">
            <h2 className="text-lg mb-2 text-center text-blue-500">Monthly Expenses</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyExpenses} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="w-[400px] flex flex-col justify-center items-center">
          <h2 className="text-lg text-blue-500 mb-2">Expenses by Category</h2>
          <PieChart width={500} height={500} margin={{ top: 30, right: 40, bottom: 20, left: 20 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120} // Slightly smaller for better fit
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
      </div>

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button onClick={back} className="border-red-500 border-2 hover:bg-red-500 hover:border-white cursor-pointer text-white px-4 py-2 rounded">Back</button>
      </div>
    </div>
  );
}

export default StatisticsPage;