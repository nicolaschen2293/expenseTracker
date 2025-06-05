import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'

function App() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  useEffect(() => {
    fetchExpenses();
    console.log(expenses)
  }, []);

  useEffect(() => {
    console.log(selectedExpenses)
  }, [selectedExpenses])

  async function fetchExpenses() {
    const res = await fetch("/api/getExpenses", {
      method:"GET"
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedExpenses),
    });

    const data = await res.json();
    console.log(data);

    if (!data.error) await fetchExpenses();
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
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <button onClick={handleSubmit}>Add Expense</button>
        {selectedExpenses && <button onClick={handleDelete}>Delete Selected</button>}
    </div>
  )
}

export default App
