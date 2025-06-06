import { useState } from "react";
import { supabase } from "../../utils/supabase.js";
import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [action, setAction] = useState('Log In');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

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

  const handleLogOut = async () => {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error

        console.log('Log Out Success!')
    } catch (err) {
        console.error("Log Out Error: ", err.message);
        setErrorMsg(err.message)
    }
  }

  const handleForgotPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Development environment
      redirectTo: 'http://localhost:3000/reset-password',
    });

    if (error) {
      setErrorMsg(`Error: ${error.message}`);
    } else {
      setErrorMsg('Password reset email sent. Check your inbox.');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
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
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2"
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

        {/* <button className='bg-red-500' onClick={handleLogOut}>Log Out</button> */}
        <button className="bg-blue-500" onClick={handleForgotPassword}>Forgot Password</button>
      </div>
    </div>
  );
}

export default LandingPage;