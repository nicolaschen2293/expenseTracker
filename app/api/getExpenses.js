import { supabase } from './utils/supabase.js';

export default async function handler(req, res) {

  // Verify Method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Extract token
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  // 2. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

  // 3. Get expenses from Supabase
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id) 
    .order('date', { ascending: false }) 
    .limit(10);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}