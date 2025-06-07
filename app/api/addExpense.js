import { supabase } from './utils/supabase.js';

export default async function handler(req, res) {

  // Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1. Extract token
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  // 2. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

  const { title, amount, category } = req.body;

  // 3. Create row in Supabase
  const { data, error } = await supabase
    .from('expenses')
    .insert([{ title, amount, category, user_id: user.id }]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: "Expense added", data });
}