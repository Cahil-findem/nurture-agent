export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const candidate_id = req.query.candidate_id;

  if (!candidate_id) {
    return res.status(400).json({ error: 'candidate_id is required' });
  }

  try {
    const url = `https://kong-email-creator.vercel.app/api/emails?candidate_id=${encodeURIComponent(candidate_id)}`;
    console.log('📧 Fetching stored emails for:', candidate_id);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Emails API error: ${response.status}`, errorText);
      return res.status(response.status).json({ error: `Emails API returned ${response.status}` });
    }

    const data = await response.json();
    console.log('✅ Stored emails fetched. Count:', data.count || data.emails?.length || 0);
    return res.json(data);
  } catch (error) {
    console.error('❌ Error fetching emails:', error.message);
    return res.status(500).json({ error: 'Failed to fetch emails', details: error.message });
  }
}
