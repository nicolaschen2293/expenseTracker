import { createSupabaseClientWithToken } from './utils/supabase.js';

export default async function handler(req, res) {

  // Only allow DELETE method
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Extract token
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  // 2. Create scoped supabase client
  const supabase = createSupabaseClientWithToken(token);

  // 3. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

  // 4. Delete the selected expenses from Supabase
  const selectedExpenses = req.body;

  const { error } = await supabase
    .from('expenses')
    .delete()
    .in('id', selectedExpenses)
    .eq('user_id', user.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Expense(s) deleted successfully' });
}