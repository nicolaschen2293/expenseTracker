import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

function ExpenseListPage() {

  // Expense Attributes
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  // List of Expenses to Display
  const [expenses, setExpenses] = useState([]);

  // List of Expenses to Delete
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  // Modals
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [openDetailedView, setOpenDetailedView] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // Selected Expense for Detailed View
  const [detailedExpense, setDetailedExpense] = useState(null);

  // Filters and Categories
  const [filter, setFilter] = useState("");
  const categoryOptions = [
    "Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Luxury", "Other"
  ];

  // Tokens and Navigations
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  // Check for User Session
  useEffect(() => {
    async function checkToken() {
      setToken(await getToken());
    }

    checkToken();
  }, [])

  // Display Expenses on Page Load
  useEffect(() => {
    async function listExpenses() {
      await fetchExpenses(null);
    }
    
    if (token) listExpenses();
  }, [token]);


  // Get Token if there is an Active Session
  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }

  // Function to Fetch Expenses from Supabase
  async function fetchExpenses(listFilter) {
    let url;

    // Display List with Category Filter
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

  // Add Checked Expenses to List
  const handleCheckboxChange = (id) => {
    setSelectedExpenses((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((eid) => eid !== id)
        : [...prevSelected, id]
    );
  };

  // Handle New Expenses
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

  // Handle Deletion of Selected Expenses
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

  // Open Edit Modal
  const handleOpenEdit = () => {
    setOpenDetailedView(false);
    setOpenEdit(true);
  }

  // Handle Editting of Expenses
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

  // Handle User Log Out
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

  // Handle Filtered List of Expenses
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

  // Open Detailed View Modal
  const handleViewDetails = (expense) => {
    setDetailedExpense(expense);
    setOpenDetailedView(true);
  }

  // Navigate to Statistics Page
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
              {expense.category} | {new Date(expense.date).toLocaleString()}
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
              <h2>Done on         : {new Date(detailedExpense.date).toLocaleString()}</h2>
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