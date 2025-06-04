import { supabase } from './utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id, user_id } = req.body;

  if (!id || !user_id) {
    return res.status(400).json({ error: 'Missing id or user_id' });
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id); // to enforce RLS

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Expense deleted successfully' });
}