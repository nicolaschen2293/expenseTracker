import { createSupabaseClientWithToken } from './utils/supabase.js';

export default async function handler(req, res) {

  // Only allow PUT method
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Get token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  // 2. Create scoped supabase client
  const supabase = createSupabaseClientWithToken(token);

  // 3. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  // 4. Get body data
  const { id, title, amount, category, dateTimeObj } = req.body;
  console.log("id: ", id);
  console.log("title: ", title);
  console.log("amount: ", amount);
  console.log("category: ", category);
  console.log("dateTimeObj: ", dateTimeObj);
  if (!id || !title || !amount || !category || !dateTimeObj) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 5. Update expense
  const { data, error } = await supabase
    .from('expenses')
    .update({ title, amount, category, date: dateTimeObj })
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, data });
}