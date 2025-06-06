import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function StatisticsPage() {
    const [expenses, setExpenses] = useState([]);

    const navigate = useNavigate();

    const [token, setToken] = useState(null);

    useEffect(() => {
        async function checkToken() {
        setToken(await getToken());
        }

        checkToken();
    }, [])

    useEffect(() => {
        console.log('Session: ', token);
    }, [token])

    useEffect(() => {
        async function listExpenses() {
        await fetchExpenses();
        }
        
        if (token) listExpenses();
    }, [token]);

    async function getToken() {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token;
    }

    async function fetchExpenses() {
        const res = await fetch("/api/getExpenses", {
        method:"GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        const data = await res.json();
        setExpenses(data);
    }

    const chartData = expenses.map(expense => ({
        title: expense.title,
        amount: expense.amount,
    }));

    return (
        <div className='flex flex-col items-center min-h-screen content-center gap-2 justify-center text-blue-500'>
            <h1 className=''>Spendings</h1>
            <BarChart width={600} height={300} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#ffffff" />
            </BarChart>
        </div>
    )
}

export default StatisticsPage