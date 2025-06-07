import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

function ExpenseListPage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [openDetailedView, setOpenDetailedView] = useState(false);
  const [detailedExpense, setDetailedExpense] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [filter, setFilter] = useState("");
  const categoryOptions = [
    "Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Luxury", "Other"
  ];

  const navigate = useNavigate();

  const [token, setToken] = useState(null);

  useEffect(() => {
    async function checkToken() {
      setToken(await getToken());
    }

    checkToken();
  }, [])

  // useEffect(() => {
  //   console.log('Session: ', token);
  // }, [token])

  useEffect(() => {
    async function listExpenses() {
      await fetchExpenses(null);
    }
    
    if (token) listExpenses();
  }, [token]);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }

  async function fetchExpenses(listFilter) {
    let url;

    if (listFilter) {
      url = `/api/getExpenses?category=${encodeURIComponent(listFilter)}`
      console.log("Filtering by ", listFilter);
      console.log("url = ", url);
    } else {
      url = "/api/getExpenses";
    }

    const res = await fetch(url, {
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

    if (!data.error) await fetchExpenses(null);
    if (openAddExpense) setOpenAddExpense(false);
    setTitle("");
    setAmount("");
    setCategory("");
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

    if (!data.error) await fetchExpenses(null);
    setSelectedExpenses([]);
  }

  const handleOpenEdit = () => {
    setOpenDetailedView(false);
    setOpenEdit(true);
  }

  const handleEdit = async () => {

    const res = await fetch("/api/editExpense", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ id: detailedExpense.id, title, amount: parseFloat(amount), category }),
    });

    const data = await res.json();
    console.log(data);

    if (!data.error) await fetchExpenses(null);
    if (openEdit) setOpenEdit(false);
    setTitle("");
    setAmount("");
    setCategory("");
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

  const handleFilter = async (newFilter) => {
    if (newFilter === "None") {
      await fetchExpenses(null);
    } else {
      setFilter(newFilter);
      await fetchExpenses(newFilter);
    }
    setFilter("");
    setOpenFilter(false);
  }

  const handleViewDetails = (expense) => {
    setDetailedExpense(expense);
    setOpenDetailedView(true);
  }

  const goToStatistics = () => {
    navigate('/statistics');
  }

  return (
    <div className="flex flex-col items-center min-h-screen content-center gap-2">
      <h1 className="text-blue-500 font-extrabold text-4xl">Expense Tracker</h1>
      <h2 className="text-xl font-bold mb-2">Recent Expenses</h2>
      <button onClick={() => setOpenFilter(true)} className='bg-yellow-500'>Filter</button>
      <ul className="space-y-2">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={selectedExpenses.includes(expense.id)}
            onChange={() => handleCheckboxChange(expense.id)}
            className="mt-3"
          />
          <li
            onClick={() => handleViewDetails(expense)}
            className="border p-2 rounded-md flex-1 cursor-pointer hover:bg-gray-800"
          >
            <div className="font-medium">{expense.title}</div>
            <div className="font-medium">Rp.{expense.amount},-</div>
            <div className="text-sm text-gray-600">
              {expense.category} | {expense.date}
            </div>
          </li>
        </div>
        ))}
      </ul>
        {openAddExpense && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="flex flex-col bg-white p-6 rounded-lg shadow-lg max-w-full gap-2">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='bg-gray-400'
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className='bg-gray-400'
                required
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='text-blue-700'
                required
              >
                <option value="">Select Category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button onClick={handleSubmit} className='bg-green-500'>Add Expense</button>
              <button onClick={() => setOpenAddExpense(false)} className='bg-red-500'>Cancel</button>
            </div>
          </div>
        )}
        {openDetailedView && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="flex flex-col text-black bg-white p-6 rounded-lg shadow-lg max-w-full gap-2">
              <h1 className='self-center text-2xl'>{detailedExpense.title}</h1>
              <h2>Expense Amount  : Rp.{detailedExpense.amount},-</h2>
              <h2>Expense Category: {detailedExpense.category}</h2>
              <h2>Done on         : {detailedExpense.date}</h2>
              <button onClick={() => handleOpenEdit()} className='bg-green-500'>Edit</button>
              <button onClick={() => setOpenDetailedView(false)} className='bg-red-500'>Close</button>
            </div>
          </div>
        )}
        {openEdit && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="flex flex-col bg-white p-6 rounded-lg shadow-lg max-w-full gap-2">
              <input
                type="text"
                placeholder={detailedExpense.title}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='bg-gray-400'
                required
              />
              <input
                type="number"
                placeholder={detailedExpense.amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className='bg-gray-400'
                required
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='text-blue-700'
                required
              >
                <option value="">Select Category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button onClick={handleEdit} className='bg-green-500'>Edit Expense</button>
              <button onClick={() => setOpenEdit(false)} className='bg-red-500'>Cancel</button>
            </div>
          </div>
        )}
        {openFilter && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="flex flex-col bg-white p-6 rounded-lg shadow-lg max-w-full gap-2">
                <select
                  value={filter}
                  onChange={(e) => handleFilter(e.target.value)}
                  className='text-blue-700'
                  required
                >
                  <option value="">Select Category</option>
                  <option value="None">None</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
            </div>
          </div>
        )}
        <button onClick={() => setOpenAddExpense(true)} className='bg-green-500'>+</button>
        {selectedExpenses.length > 0 && <button onClick={handleDelete} className='bg-red-500'>Delete Selected</button>}
        {token && <button className='bg-blue-500' onClick={goToStatistics}>Statistics</button>}
        {token && <button className='bg-red-500' onClick={handleLogOut}>Log Out</button>}
    </div>
  )
}

export default ExpenseListPage