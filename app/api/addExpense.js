export default function handler(req, res) {
  if (req.method === 'POST') {
    // Add to DB (e.g., Supabase)
    res.status(201).json({ message: 'Expense added' });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}