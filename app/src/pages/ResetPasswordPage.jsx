import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase.js';
import { useNavigate } from 'react-router-dom';

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically logs in the user from the email link
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setMessage('Session not found. Open the reset link from your email.');
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Password updated! You can now close this tab and login with your new password.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <h1>Reset Password</h1>
        <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 my-2 "
        />
        <button onClick={handleReset} className="bg-green-500 text-white px-4 py-2">
            Update Password
        </button>
        {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPasswordPage;