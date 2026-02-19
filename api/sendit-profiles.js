export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tc_id, account_id } = req.query;

  if (!tc_id || !account_id) {
    return res.status(400).json({ error: 'tc_id and account_id are required' });
  }

  const url = `https://matches.findem.ai/hm/api/tc/person?tc_id=${encodeURIComponent(tc_id)}&skinny=true&account_id=${encodeURIComponent(account_id)}&timestamp=12`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'origin': 'https://app-next.findem.ai',
        'referer': 'https://app-next.findem.ai/',
        'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache',
        'Cookie': 'connect.sid=s%3AQdluXlAv2wL_aEghi7mfTW-wWV6qtzN6.xV0Qhp5VhLirY%2FhMT7rFIJ9faJGVqRB3Ke7jybUWcWo; _csrf=w2vpD4dYhDkmUIius7Q6nkCP; f4m.sticky=v1e0578f19; __adroll_fpc=c6415d7c43262ad269430c843c7bfbb0-1759264841020; cookieyes-consent=consentid:WHRLbHhJZVJlTXR3b0F4MUpUQWNCZDRNbXRpTWNEcmE,consent:no,action:yes,necessary:yes,functional:no,analytics:no,performance:no,advertisement:no,other:no; ajs_anonymous_id=%22c72107e0-886b-4e13-88c8-5cb782099de3%22; __stripe_mid=b828ef3c-2ab5-4369-a433-ddd3e74a9776fbc329; initialTrafficSource=utm_src=google|utm_med=organic|utm_camp=(not set)|utm_trm=(not provided); __utmzzses=1; 3c7cdcb85f1d7be5_cfid=a5fca5d30cef6ddba4731cbf269e7c623c4d620451fb42d7591e7a1ed646e504734c3e0e42cf6b2ae25bd389ba48b0bdd1b5d1c785a7447928fe55a4a783ae53; intercom-device-id-lxdw5ft0=d107f80c-6531-48ac-ab43-99901305f064; _ga=GA1.1.1679878304.1767729887; _ga_3NFPTDY8P2=GS2.1.s1770150131$o15$g1$t1770150171$j20$l0$h0; f4m.account.domain=findem.ai; f4m.account.id=cam16rslteetipuobz1m2; intercom-session-lxdw5ft0=QTNSYWZ1b3VGZnJrdU1RcmtZMFN4TTNkdU1Zam0xZG1zbTM0TUQwc2hWR0xEOFFsL2VMeEhLUW9rMHQ0L0tNU2F5L1NDUEpTamhZUEkxeUwyQXhpVDBxaktHVlNpVTJ4bDdaZUgwZzBtL3M9LS1zL1FMUUhrSENsUi9lVndlbyt1cDB3PT0=--5e8770e86bce8d1e251050beb940f97004d1439c; fs_lua=1.1770444339514; fs_uid=#VB5PS#7c6359f8-db5b-41a3-8cba-c8c55fc931da:e6bf01c6-2e22-47c1-bda0-5975d740e71e:1770441412231::2#5bd9db6e#/1801686254; _csrf=LsCGhI6StjJrsLsMoRX8shRr; connect.sid=s%3Aij1VrGnsn7ONxNsp4pjWTIbbgup0VnMR.4Gj7LU7HdgWci18r9DYzVNZS8tHIqK8A9J2Bp%2BfnMn8'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Findem API error: ${response.status}`, errorText);
      return res.status(response.status).json({ error: `Findem API returned ${response.status}` });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Error fetching profiles from Findem:', error.message);
    return res.status(500).json({ error: 'Failed to fetch profiles', details: error.message });
  }
}
