import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { DateTime } from 'luxon';

function ExpenseListPage() {

  // Expense Attributes
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [dateTime, setDateTime] = useState(DateTime.now().setZone("Asia/Jakarta"));

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

  // Categories
  const categoryOptions = [
    "Food", "Transport", "Bills", "Shopping", "Health", "Entertainment", "Luxury", "Other"
  ];

  // Filters
  const [filtered, setFiltered] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartdate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sorting
  const [sorting, setSorting] = useState("");
  const [openSorting, setOpenSorting] = useState(false);

  // User Feedbacks
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Tokens and Navigations
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        await fetchExpenses();
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    }
    
    if (token) listExpenses();
  }, [token]);

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
    const token = data?.session?.access_token;

    if (!token) {
      navigate('/');
      return null;
    }

    return token;
  }

  // Function to Fetch Expenses from Supabase
  async function fetchExpenses(category = categoryFilter, min = minAmount, max = maxAmount, start = startDate, end = endDate, sort = sorting, page = currentPage) {
    setIsLoading(true)
    if (openSorting) setOpenSorting(false);

    console.log('page = ', page)
    let url = `/api/getExpenses?page=${page}&`;

    // Check for filters and modify URL
    if (category) url += `category=${encodeURIComponent(categoryFilter)}&`;
    if (min) url += `minAmount=${minAmount}&`;
    if (max) url += `maxAmount=${maxAmount}&`;
    if (start) url += `startDate=${encodeURIComponent(startDate)}&`;
    if (end) url += `endDate=${encodeURIComponent(endDate)}&`;

    // Set sorting mode
    if (!sort || sort === "" || sort === "date descending") {
      url += `sorting=datedescending&`
    } else if (sort === "date ascending") {
      url += `sorting=dateascending&`
    } else if (sort === "amount descending") {
      url += `sorting=amountdescending&`
    } else if (sort === "amount ascending") {
      url += `sorting=amountascending&`
    } else {
      throw new Error("Invalid sorting");
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

      setExpenses(data.data);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      throw err;
    } finally {
      setIsLoading(false);
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
      console.log(dateTime);
      console.log(typeof dateTime);

      const res = await fetch("/api/addExpense", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title, amount: parseFloat(amount), category, dateTimeObj: dateTime.toUTC().toISO()}),
      });

      const data = await res.json();
      console.log(data);

      if (data.error) throw new Error(data.error || 'Failed to create expense.');
        
      try {
        await fetchExpenses("","","","","","",1);
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
      setDateTime(DateTime.now().setZone("Asia/Jakarta"));
      setIsLoading(false);
      await clearFilter();
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
        await fetchExpenses("","","","","","",1);
      } catch (err) {
        throw new Error('Expense(s) deleted, failed to fetch expenses.')
      }
      setMessage({ type: 'success', text: 'Expense(s) deleted successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSelectedExpenses([]);
      setIsLoading(false);
      await clearFilter();
    }
    
  }

  // Open Edit Modal
  const handleOpenEdit = () => {
    setOpenDetailedView(false);
    setTitle(detailedExpense.title);
    setAmount(detailedExpense.amount);
    setCategory(detailedExpense.category);
    setDateTime(DateTime.fromISO(detailedExpense.date).setZone('Asia/Jakarta'));
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
        await fetchExpenses("","","","","","",1);
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
      setDateTime(DateTime.now().setZone("Asia/Jakarta"));
      setIsLoading(false);
      await clearFilter();
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
  const handleFilter = async () => {
    setIsLoading(true);
    setMessage(null);
    setFiltered(true);
    setCurrentPage(1);

    try {
      await fetchExpenses(categoryFilter, minAmount, maxAmount, startDate, endDate, sorting, 1);
      setMessage({ type: 'success', text: 'Filter applied!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setOpenFilter(false);
      setIsLoading(false);
    }
  }

  const clearFilter = async () => {
    setCategoryFilter("");
    setMinAmount("");
    setMaxAmount("");
    setStartdate("");
    setEndDate("");
    setSorting("");
    setCurrentPage(1);
    setFiltered(false);

    try {
      await fetchExpenses("","","","","","",1);
      setMessage({ type: 'success', text: 'Filter cleared!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  const handlePageChange = async(change) => {
    const nextPage = currentPage + change;
    setCurrentPage(nextPage);

    try {
      if (!filtered) {
        await fetchExpenses("","","","","","",nextPage);
      } else {
        await fetchExpenses(categoryFilter, minAmount, maxAmount, startDate, endDate, sorting, nextPage);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
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
                    className="mt-2 mr-2 w-5 h-5"
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
            <div className="flex flex-col bg-[#242424] text-white p-6 rounded-lg shadow-lg max-w-full gap-2">
              <h1 className='text-blue-500 self-center text-2xl font-bold'>Create Expense</h1>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='bg-gray-600'
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className='bg-gray-600'
                required
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='bg-gray-600'
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
                value={dateTime.toFormat("yyyy-MM-dd'T'HH:mm")}
                onChange={(e) =>
                  setDateTime(DateTime.fromISO(e.target.value, { zone: "Asia/Jakarta" }))
                }
                className="bg-gray-600"
              />
              <button onClick={handleSubmit} className='border-green-500 border-solid border-2 hover:bg-green-500 hover:border-white cursor-pointer'>Add Expense</button>
              <button onClick={() => {
                setTitle("");
                setAmount("");
                setCategory("");
                setDateTime(DateTime.now().setZone("Asia/Jakarta"));
                setOpenAddExpense(false);
                }} className='border-2 border-red-500 hover:border-white hover:bg-red-500 cursor-pointer'>Cancel</button>
            </div>
          </div>
        )}
        {openDetailedView && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="flex flex-col bg-[#242424] p-6 rounded-lg shadow-lg max-w-full gap-2">
              <h1 className='text-blue-500 self-center text-2xl font-bold'>{detailedExpense.title}</h1>
              <h2>Expense Amount  : Rp.{detailedExpense.amount},-</h2>
              <h2>Expense Category: {detailedExpense.category}</h2>
              <h2>Done on         : {new Date(detailedExpense.date).toLocaleString()}</h2>
              <button onClick={() => handleOpenEdit()} className='border-green-500 border-solid border-2 hover:bg-green-500 hover:border-white cursor-pointer'>Edit</button>
              <button onClick={() => setOpenDetailedView(false)} className='border-2 border-red-500 hover:border-white hover:bg-red-500 cursor-pointer'>Close</button>
            </div>
          </div>
        )}
        {openEdit && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="flex flex-col bg-[#242424] p-6 rounded-lg shadow-lg max-w-full gap-2">
              <h1 className='text-blue-500 self-center text-2xl font-bold'>Edit Expense</h1>
              <input
                type="text"
                placeholder={detailedExpense.title}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='bg-gray-600'
                required
              />
              <input
                type="number"
                placeholder={detailedExpense.amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className='bg-gray-600'
                required
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='bg-gray-600'
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
                value={dateTime.toFormat("yyyy-MM-dd'T'HH:mm")}
                onChange={(e) =>
                  setDateTime(DateTime.fromISO(e.target.value, { zone: "Asia/Jakarta" }))
                }
                className="bg-gray-600"
              />
              <button onClick={handleEdit} className='border-green-500 border-solid border-2 hover:bg-green-500 hover:border-white cursor-pointer'>Edit Expense</button>
              <button onClick={() => {
                setTitle("");
                setAmount("");
                setCategory("");
                setDateTime(DateTime.now().setZone("Asia/Jakarta"));
                setOpenEdit(false)
                }} className='border-2 border-red-500 hover:border-white hover:bg-red-500 cursor-pointer'>Cancel</button>
            </div>
          </div>
        )}
        {openFilter && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="flex flex-col bg-[#242424] p-6 rounded-lg shadow-lg max-w-full gap-2">
                <h1 className='text-blue-500 self-center text-2xl font-bold'>Filters</h1>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className='bg-gray-600'
                  required
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <label htmlFor='minamount' className='text-gray-400'>Min Amount:</label>
                <input
                  type="number"
                  id='minamount'
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className='bg-gray-600'
                  required
                />
                <label htmlFor='maxamount' className='text-gray-400'>Max Amount:</label>
                <input
                  type="number"
                  id='maxamount'
                  placeholder="-"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className='bg-gray-600'
                  required
                />
                <label htmlFor='startdate' className='text-gray-400'>Start Date:</label>
                <input
                  type="date"
                  id="startdate"
                  value={startDate}
                  onChange={(e) => setStartdate(e.target.value)}
                  className="bg-gray-600"
                />
                <label htmlFor='enddate' className='text-gray-400'>End Date:</label>
                <input
                  type="date"
                  id="enddate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-gray-600"
                />
                <select
                  value={sorting}
                  onChange={(e) => setSorting(e.target.value)}
                  className='bg-gray-600'
                  required
                >
                  <option value="">Sort by</option>
                  <option value="date descending">Date Descending</option>
                  <option value="date ascending">Date Ascending</option>
                  <option value="amount ascending">Amount Ascending</option>
                  <option value="amount descending">Amount Descending</option>
                </select>
                <button onClick={handleFilter} className='border-green-500 border-solid border-2 hover:bg-green-500 hover:border-white cursor-pointer'>Apply</button>
                <button onClick={() => setOpenFilter(false)} className='border-2 border-red-500 hover:border-white hover:bg-red-500 cursor-pointer'>Close</button>
            </div>
          </div>
        )}
        <div className="fixed flex bottom-20 bg-[#242424] gap-2 left-0 w-full py-4 justify-center items-center">
          <button className='text-blue-400 disabled:text-gray-400 hover:text-white cursor-pointer text-2xl mb-1' onClick={() => handlePageChange(-currentPage+1)} disabled={currentPage == 1}>&laquo;</button>
          <button className='text-blue-400 disabled:text-gray-400 hover:text-white cursor-pointer' onClick={() => handlePageChange(-1)} disabled={currentPage <= 1}>Prev</button>
          {currentPage > 2 && <button className='text-blue-400 disabled:text-gray-400 hover:text-white cursor-pointer' onClick={() => handlePageChange(-2)} disabled={currentPage <= 2}>{currentPage > 2 ? currentPage - 2 : ""}</button>}
          {currentPage + 2 <= totalPages && <button className='text-blue-400 disabled:text-gray-400 hover:text-white cursor-pointer' onClick={() => handlePageChange(2)} disabled={currentPage + 2 > totalPages}>{currentPage + 2}</button>}
          {currentPage + 3 <= totalPages && <button className='text-blue-400 disabled:text-gray-400 hover:text-white cursor-pointer' onClick={() => handlePageChange(3)} disabled={currentPage + 3 > totalPages}>{currentPage + 3}</button>}
          <button className='text-blue-400 disabled:text-gray-400 hover:text-white cursor-pointer' onClick={() => handlePageChange(1)} disabled={currentPage + 1 > totalPages}>Next</button>
          <button className='text-blue-400 disabled:text-gray-400 hover:text-white cursor-pointer text-2xl mb-1' onClick={() => handlePageChange(totalPages - currentPage)} disabled={currentPage == totalPages}>&raquo;</button>
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
            setDateTime(DateTime.now().setZone("Asia/Jakarta"));
            }} className='border-green-500 border-solid border-2 hover:bg-green-500 hover:border-white cursor-pointer'>Add</button>
          <button onClick={() => setOpenFilter(true)} className='border-2 border-blue-500 hover:bg-blue-500 hover:border-white cursor-pointer'>Filter</button>
          {filtered && <button onClick={clearFilter} className='border-2 border-red-500 hover:border-white hover:bg-red-500 cursor-pointer'>Clear Filter</button>}
          {selectedExpenses.length > 0 && <button onClick={handleDelete} className='border-2 border-red-500 hover:border-white hover:bg-red-500 cursor-pointer'>Delete</button>}
          {token && <button className='border-2 border-blue-500 hover:bg-blue-500 hover:border-white cursor-pointer' onClick={goToStatistics}>Statistics</button>}
          {token && <button className='border-2 border-red-500 hover:border-white hover:bg-red-500 cursor-pointer' onClick={handleLogOut}>Log Out</button>}
        </div>
    </div>
  )
}

export default ExpenseListPage