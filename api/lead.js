export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, nombre } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });

  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email,
        attributes: { NOMBRE: nombre || '' },
        listIds: [3],
        updateEnabled: true
      })
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'brevo error' });
  }
}
