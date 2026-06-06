export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.8,
      }),
    });
    const raw = await response.text();
    if (!response.ok) {
      return res.status(200).json({ text: "ERROR DETALLE: " + raw });
    }
    const data = JSON.parse(raw);
    const text = data.choices?.[0]?.message?.content || 'Sin respuesta';
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(200).json({ text: "EXCEPCION: " + e.message });
  }
}
