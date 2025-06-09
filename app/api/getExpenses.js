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
    .select('*', { count: 'exact' })
    .eq('user_id', user.id) 

  // 5. Apply filters
  const { category, minAmount, maxAmount, startDate, endDate, page = 1, sorting, all } = req.query;
  const offset = (parseInt(page, 10) - 1) * 10;

  if (category) query = query.eq("category", category);
  if (minAmount) query = query.gte("amount", parseFloat(minAmount));
  if (maxAmount) query = query.lte("amount", parseFloat(maxAmount));
  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);

  // 6. Set page
  if (!all) query = query.range(offset, offset + 9);

  // 7. Set sorting
  if (sorting === "datedescending") {
    query = query.order('date', { ascending: false })
  } else if (sorting === "dateascending") {
    query = query.order('date')
  } else if (sorting === "amountdescending") {
    query = query.order('amount', { ascending: false })
  } else if (sorting === "amountascending") {
    query = query.order('amount')
  } else {
    return res.status(500).json({ error: 'Invalid sorting' });
  }

  // 8. Get expenses from Supabase
  const { count, data, error } = await query

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ data, total: count });
}