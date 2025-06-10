import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase.js";
import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [action, setAction] = useState('Log In');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/expenses');
      }
    }

    getSession()
  }, [])

  // Handle Sign In / Sign Up
  const handleSubmit = async () => {
    setErrorMsg('');
    try {
      let data, error;

      if (action === 'Log In') {
        ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
      } else if (action === 'Sign Up') {
        ({ data, error } = await supabase.auth.signUp({ email, password }));
      } else {
        throw new Error("Invalid Action");
      }

      if (error) throw error;
      console.log("Success!", data);
      navigate('/expenses');

    } catch (err) {
      console.error("Authentication Error:", err.message);
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#242424]">
      <div className="bg-black p-6 rounded shadow-md w-80">
        <h1 className="text-2xl font-bold mb-4 text-center">{action}</h1>

        <input
          type="text"
          placeholder="Email"
          className="w-full mb-2 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {errorMsg && <div className="text-red-500 mb-2 text-sm">{errorMsg}</div>}

        <button
          className="w-full rounded mb-2 border-green-500 border-solid border-2 hover:bg-green-500 hover:border-white cursor-pointer"
          onClick={handleSubmit}
        >
          {action}
        </button>

        <div className="flex justify-between bg-black">
          <button
            onClick={() => setAction('Sign Up')}
            className={`text-sm ${action === 'Sign Up' ? 'font-bold' : ''}`}
            disabled={action === 'Sign Up'}
          >
            Sign Up
          </button>
          <button
            onClick={() => setAction('Log In')}
            className={`text-sm ${action === 'Log In' ? 'font-bold' : ''}`}
            disabled={action === 'Log In'}
          >
            Log In
          </button>
        </div>

        {/* Removed as it was causing too much problems */}
        {/* <button className="bg-blue-500" onClick={handleForgotPassword}>Forgot Password</button> */}
      </div>
    </div>
  );
}

export default LandingPage;