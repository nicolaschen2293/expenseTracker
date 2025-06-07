import { use } from 'react';
import { supabase } from './utils/supabase.js';

export default async function handler(req, res) {

  // Only allow PUT method
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Get token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  // 2. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  // 3. Get body data
  const { id, title, amount, category } = req.body;
  if (!id || !title || !amount || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 4. Update expense
  const { data, error } = await supabase
    .from('expenses')
    .update({ title, amount, category })
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, data });
}