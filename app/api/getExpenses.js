import { supabase } from './utils/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log("Getting recent expenses");

//   const { user_id } = req.query;

//   if (!user_id) {
//     return res.status(400).json({ error: 'Missing user_id' });
//   }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    //.eq('user_id', user_id) // optional, for multi-user support
    // .order('date', { ascending: false }) // make sure your table has a `date` field
    // .limit(10);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  console.log("data received, no error")

  return res.status(200).json(data);
}