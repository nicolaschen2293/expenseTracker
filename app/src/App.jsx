import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/addExpense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount: parseFloat(amount) }),
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <div className="flex flex-col items-center min-h-screen content-center gap-2">
      <h1 className="text-blue-500 font-extrabold text-4xl">Expense Tracker</h1>
      <h2 className='justify-self-center'>List of expenses goes here.</h2>
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
        <button onClick={handleSubmit}>Add Expense</button>
    </div>
  )
}

export default App
