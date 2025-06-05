import { supabase } from "./utils/supabase.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { title, amount, category } = req.body;
    console.log('received, trying to upload to supabase');

    const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            title: title,
            amount: amount,
            category: category,
          }
        ]);

    if (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }

    console.log('upload success!');
    console.log(data)

    // Example: log or send to Supabase
    console.log("Received:", title, amount);

    res.status(201).json({ message: "Expense added", title, amount });
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}