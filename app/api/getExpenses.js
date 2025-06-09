import { createSupabaseClientWithToken } from './utils/supabase.js';

export default async function handler(req, res) {

  // Only allow GET method
  if (req.method !== 'GET') {
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

  // 4. Create query
  let query = supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id) 
    .order('date', { ascending: false }) 
    // .limit(10);

  // 5. Check for filters and pages
  const category = req.query.category;
  if (category) {
    query = query.eq('category', category);
  }

  const page = parseInt(req.query.page, 10) || 1;
  const offset = (page - 1) * 10;
  query = query.range(offset, offset + 10 - 1);

  // 6. Get expenses from Supabase
  const { data, error } = await query

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}