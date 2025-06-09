import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

function ExpenseListPage() {

  // Expense Attributes
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [dateTime, setDateTime] = useState("");

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

  // User Feedbacks
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Tokens and Navigations
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

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
      try {
        await fetchExpenses(null);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    }
    
    console.log("Page changed to: ", currentPage);
    if (token) listExpenses();
  }, [token, currentPage]);

  // Dismiss message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);


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
      url = `/api/getExpenses?category=${encodeURIComponent(listFilter)}&page=${currentPage}`
      console.log("Filtering by ", listFilter);
      console.log("url = ", url);
    } else {
      url = `/api/getExpenses?page=${currentPage}`;
    }

    try {
      const res = await fetch(url, {
        method:"GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error || 'Failed to fetch expenses.');

      setExpenses(data);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      throw err;
    } finally {

    }
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
    setIsLoading(true);
    setMessage(null);

    try {
      const dateTimeObj = new Date(dateTime);

      const res = await fetch("/api/addExpense", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title, amount: parseFloat(amount), category, dateTimeObj}),
      });

      const data = await res.json();
      console.log(data);

      if (data.error) throw new Error(data.error || 'Failed to create expense.');
        
      try {
        await fetchExpenses(null);
      } catch (err) {
        throw new Error('Expense created, failed to fetch expenses.');
      }
      setMessage({ type: 'success', text: 'Expense added successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      if (openAddExpense) setOpenAddExpense(false);
      setTitle("");
      setAmount("");
      setCategory("");
      setDateTime("");
      setIsLoading(false);
    }
  };

  // Handle Deletion of Selected Expenses
  const handleDelete = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/deleteExpense", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(selectedExpenses),
      });

      const data = await res.json();
      console.log(data);

      if (data.error) throw new Error(data.error || 'Failed to delete expense.');

      try {
        await fetchExpenses(null);
      } catch (err) {
        throw new Error('Expense(s) deleted, failed to fetch expenses.')
      }
      setMessage({ type: 'success', text: 'Expense(s) deleted successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSelectedExpenses([]);
      setIsLoading(false);
    }
    
  }

  // Open Edit Modal
  const handleOpenEdit = () => {
    setOpenDetailedView(false);
    setTitle(detailedExpense.title);
    setAmount(detailedExpense.amount);
    setCategory(detailedExpense.category);
    setDateTime(new Date(detailedExpense.date).toISOString().slice(0, 16));
    setOpenEdit(true);
  }

  // Handle Editing of Expenses
  const handleEdit = async () => {
    setIsLoading(true);
    setMessage(null);

    const dateTimeObj = new Date(dateTime)

    try {
      const res = await fetch("/api/editExpense", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ id: detailedExpense.id, title, amount: parseFloat(amount), category, dateTimeObj }),
      });

      const data = await res.json();
      console.log(data);

      if (data.error) throw new Error(data.error || 'Failed to edit expense.');

      try {
        await fetchExpenses(null);
      } catch (err) {
        throw new Error('Expense edited, failed to fetch expenses.')
      }
      setMessage({ type: 'success', text: 'Expense edited successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      if (openEdit) setOpenEdit(false);
      setTitle("");
      setAmount("");
      setCategory("");
      setDateTime("");

      setIsLoading(false);
    }
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
    setIsLoading(true);
    setMessage(null);

    if (newFilter === "None") {
      try {
        await fetchExpenses(null);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    } else {
      try {
        setFilter(newFilter);
        await fetchExpenses(newFilter);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    }

    setFilter("");
    setOpenFilter(false);
    setIsLoading(false);
    setMessage({ type: 'success', text: 'Filter applied!' });
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
      <div className="overflow-x-auto pb-20">
        <table className="text-sm text-left">
          <thead className="bg-gray-200 text-gray-700 uppercase w-max">
            <tr>
              <th></th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b hover:bg-gray-600 cursor-pointer"
                onClick={() => handleViewDetails(expense)}
              >
                <td className="text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedExpenses.includes(expense.id)}
                    onChange={() => handleCheckboxChange(expense.id)}
                    className="mt-3"
                  />
                </td>
                <td className="px-4 py-2">{expense.title}</td>
                <td className="px-4 py-2 text-right">Rp.{expense.amount},-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
                className='bg-gray-400'
                required
              >
                <option value="">Select Category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="datetime-local"
                id="datetime"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="bg-gray-400"
              />
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
                className='bg-gray-400'
                required
              >
                <option value="">Select Category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="datetime-local"
                id="datetime"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="bg-gray-400"
              />
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
        <div className="fixed flex bottom-15 bg-[#242424] gap-2 left-0 w-full py-4 justify-center items-center">
          <button onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
          <button onClick={() => setCurrentPage(currentPage - 2)}>{currentPage > 2 ? currentPage - 2 : ""}</button>
          <button onClick={() => setCurrentPage(currentPage + 2)}>{currentPage + 2}</button>
          <button onClick={() => setCurrentPage(currentPage + 3)}>{currentPage + 3}</button>
          <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        </div>
        <div className="fixed flex flex-col bottom-10 bg-[#242424] gap-2 left-0 w-full py-4 justify-center items-center">
          {isLoading && <div className="text-blue-600 self-center">Loading...</div>}
          {message && (
            <div
              className={`p-2 rounded text-white mt-2 ${
                message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
        <div className="fixed flex bottom-0 bg-[#242424] gap-2 left-0 w-full py-4 justify-center items-center">
          <button onClick={() => {
            setOpenAddExpense(true)
            const now = new Date().toISOString().slice(0, 16);
            setDateTime(now);
            }} className='bg-green-500 w-max'>+</button>
          <button onClick={() => setOpenFilter(true)} className='bg-yellow-500'>Filter</button>
          {selectedExpenses.length > 0 && <button onClick={handleDelete} className='bg-red-500'>Delete Selected</button>}
          {token && <button className='bg-blue-500 w-max' onClick={goToStatistics}>Statistics</button>}
          {token && <button className='bg-red-500 w-max' onClick={handleLogOut}>Log Out</button>}
        </div>
    </div>
  )
}

export default ExpenseListPage