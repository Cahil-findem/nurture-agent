export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emailId, status } = req.body;

  if (!emailId || !status) {
    return res.status(400).json({ error: 'emailId and status are required' });
  }

  try {
    console.log('📧 Updating email status:', emailId, '→', status);

    const response = await fetch(`https://kong-email-creator.vercel.app/api/emails/${emailId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Email status API error: ${response.status}`, errorText);
      return res.status(response.status).json({ error: `Email status API returned ${response.status}` });
    }

    const data = await response.json();
    console.log('✅ Email status updated:', data);
    return res.json(data);
  } catch (error) {
    console.error('❌ Error updating email status:', error.message);
    return res.status(500).json({ error: 'Failed to update email status', details: error.message });
  }
}
