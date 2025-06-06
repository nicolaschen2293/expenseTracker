import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

function ExpenseListPage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);

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

  const handleCheckboxChange = (id) => {
    setSelectedExpenses((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((eid) => eid !== id)
        : [...prevSelected, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/addExpense", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ title, amount: parseFloat(amount), category }),
    });

    const data = await res.json();
    console.log(data);

    if (!data.error) await fetchExpenses();
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/deleteExpense", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(selectedExpenses),
    });

    const data = await res.json();
    console.log(data);

    if (!data.error) await fetchExpenses();
  }

  const handleLogOut = async () => {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error

        console.log('Log Out Success!');
        navigate('/');
    } catch (err) {
        console.error("Log Out Error: ", err.message);
    }
  }

  const goToStatistics = () => {
    navigate('/statistics');
  }

  return (
    <div className="flex flex-col items-center min-h-screen content-center gap-2">
      <h1 className="text-blue-500 font-extrabold text-4xl">Expense Tracker</h1>
      <h2 className="text-xl font-bold mb-2">Recent Expenses</h2>
      <ul className="space-y-2">
        {expenses.map((expense) => (
          <li key={expense.id} className="border p-2 rounded-md">
            <input
              type="checkbox"
              checked={selectedExpenses.includes(expense.id)}
              onChange={() => handleCheckboxChange(expense.id)}
            />
            <div className="font-medium">{expense.title}</div>
            <div className='font-medium'>Rp.{expense.amount},-</div>
            <div className="text-sm text-gray-600">
              {expense.category} | {expense.date}
            </div>
          </li>
        ))}
      </ul>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Bills">Bills</option>
          <option value="Shopping">Shopping</option>
          <option value="Health">Health</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Luxury">Luxury</option>
          <option value="Other">Other</option>
        </select>
        <button onClick={handleSubmit}>Add Expense</button>
        {selectedExpenses && <button onClick={handleDelete}>Delete Selected</button>}
        {token && <button className='bg-blue-500' onClick={goToStatistics}>Statistics</button>}
        {token && <button className='bg-red-500' onClick={handleLogOut}>Log Out</button>}
    </div>
  )
}

export default ExpenseListPage