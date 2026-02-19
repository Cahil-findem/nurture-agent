export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { joid, refs } = req.body;

  if (!joid || !refs) {
    return res.status(400).json({ error: 'joid and refs are required' });
  }

  // refs can come as an array or string; API expects comma-separated string
  const refsStr = Array.isArray(refs) ? refs.join(',') : refs;
  console.log('📇 Fetching contacts for refs:', refsStr);

  try {
    const response = await fetch('https://sourcing.findem.ai/api/candidates', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        'origin': 'https://app-next.findem.ai',
        'referer': 'https://app-next.findem.ai/',
        'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'Cookie': 'connect.sid=s%3AQdluXlAv2wL_aEghi7mfTW-wWV6qtzN6.xV0Qhp5VhLirY%2FhMT7rFIJ9faJGVqRB3Ke7jybUWcWo; _csrf=w2vpD4dYhDkmUIius7Q6nkCP; f4m.sticky=v1e0578f19; __adroll_fpc=c6415d7c43262ad269430c843c7bfbb0-1759264841020; cookieyes-consent=consentid:WHRLbHhJZVJlTXR3b0F4MUpUQWNCZDRNbXRpTWNEcmE,consent:no,action:yes,necessary:yes,functional:no,analytics:no,performance:no,advertisement:no,other:no; ajs_anonymous_id=%22c72107e0-886b-4e13-88c8-5cb782099de3%22; initialTrafficSource=utm_src=google|utm_med=organic|utm_camp=(not set)|utm_trm=(not provided); __utmzzses=1; 3c7cdcb85f1d7be5_cfid=a5fca5d30cef6ddba4731cbf269e7c623c4d620451fb42d7591e7a1ed646e504734c3e0e42cf6b2ae25bd389ba48b0bdd1b5d1c785a7447928fe55a4a783ae53; intercom-device-id-lxdw5ft0=d107f80c-6531-48ac-ab43-99901305f064; f4m.account.domain=findem.ai; f4m.account.id=cam16rslteetipuobz1m2; intercom-session-lxdw5ft0=Rnk2bjhzclhQQXBFZEZsRnFXVVF5dlZVbGJ5WUo5TFBkNWlTYkFObkpmZEdhaUtFN2lmRXRsVUNHRlJwaGoyWVovTUhLTVo5R1VhRlU4ei9QcHljSHc2bXFCdVROUFhLNDh5TGxFSFJHN1E9LS01M243R0h4aklEUHFxdlpiMW1NYWN3PT0=--593aea438787a1daedbfba1aa507e9a80ffe3140; _ga=GA1.2.1679878304.1767729887; _gid=GA1.2.353616479.1770675373; _ga_3NFPTDY8P2=GS2.1.s1770675372$o16$g1$t1770675741$j60$l0$h0; fs_uid=#VB5PS#7c6359f8-db5b-41a3-8cba-c8c55fc931da:ef9438a5-723f-41ef-9d75-00966009dd02:1770737731459::1#5bd9db6e#/1801686291; fs_lua=1.1770738748562; _csrf=i-jP6fhJVz-vuX2HxIn4yFE8; connect.sid=s%3AWczJ8yXAj9ALXeFjqmpxMNR8G_dT8z7j.pqtf5caZWRLl3qgT5ctbQcEtTvp%2BXaa%2Bq%2FyxV%2BnxhKA'
      },
      body: JSON.stringify({
        type: 'ShowContactsMulti',
        joid: joid,
        refs: refsStr
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Contacts API error: ${response.status}`, errorText);
      return res.status(response.status).json({ error: `Contacts API returned ${response.status}` });
    }

    const data = await response.json();
    console.log('✅ Contacts fetched. Keys:', Object.keys(data));
    return res.json(data);
  } catch (error) {
    console.error('❌ Error fetching contacts:', error.message);
    return res.status(500).json({ error: 'Failed to fetch contacts', details: error.message });
  }
}
