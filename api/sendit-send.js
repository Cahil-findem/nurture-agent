export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { account_id, joid, prid, subject, body_html, to_name, to_email } = req.body;

  if (!account_id || !joid || !prid || !subject || !body_html) {
    return res.status(400).json({ error: 'account_id, joid, prid, subject, and body_html are required' });
  }

  console.log('📧 Sending email for:', to_name, '| PRID:', prid);

  try {
    const response = await fetch('https://matches.findem.ai/hm/api/email_templates', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'sec-ch-ua-platform': '"macOS"',
        'Referer': 'https://app-next.findem.ai/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'Cookie': 'connect.sid=s%3AQdluXlAv2wL_aEghi7mfTW-wWV6qtzN6.xV0Qhp5VhLirY%2FhMT7rFIJ9faJGVqRB3Ke7jybUWcWo; _csrf=w2vpD4dYhDkmUIius7Q6nkCP; f4m.sticky=v1e0578f19; f4m.account.domain=findem.ai; f4m.account.id=cam16rslteetipuobz1m2; __adroll_fpc=c6415d7c43262ad269430c843c7bfbb0-1759264841020; cookieyes-consent=consentid:WHRLbHhJZVJlTXR3b0F4MUpUQWNCZDRNbXRpTWNEcmE,consent:no,action:yes,necessary:yes,functional:no,analytics:no,performance:no,advertisement:no,other:no; ajs_anonymous_id=%22c72107e0-886b-4e13-88c8-5cb782099de3%22; __stripe_mid=b828ef3c-2ab5-4369-a433-ddd3e74a9776fbc329; initialTrafficSource=utm_src=google|utm_med=organic|utm_camp=(not set)|utm_trm=(not provided); __utmzzses=1; 3c7cdcb85f1d7be5_cfid=a5fca5d30cef6ddba4731cbf269e7c623c4d620451fb42d7591e7a1ed646e504734c3e0e42cf6b2ae25bd389ba48b0bdd1b5d1c785a7447928fe55a4a783ae53; _ga_3NFPTDY8P2=GS2.1.s1769718397$o9$g0$t1769718397$j60$l0$h0; _ga=GA1.2.1679878304.1767729887; _gid=GA1.2.1270408378.1769718397; intercom-session-lxdw5ft0=N3Vtc3AvaGwvVDFMOU9GRHJ0QUNvYkdJVG9uSGZrSS9NVXIvUGRLU2Jla1ZsWWlJU2VXVDlJU24wTUc4dGV5Nk0yQndLOEJCN2hPZVE3MUczS1ZQVUxuclowQ0pyN3Y5U2dTMUs0S1ZqVFU9LS1CM1NxRDBUVXJOcGpDQzFEendLd2J3PT0=--0bd064249456d8ba12e900ff8c0bcd44d1435372; intercom-device-id-lxdw5ft0=d107f80c-6531-48ac-ab43-99901305f064; fs_lua=1.1769733748982; fs_uid=#VB5PS#5082f886-08b0-448d-afb8-0e76f9270073:49adc66d-715a-48b2-bb3e-7f7b63364763:1769733324906::2#5bd9db6e#/1785862642; _csrf=i-jP6fhJVz-vuX2HxIn4yFE8; connect.sid=s%3AWczJ8yXAj9ALXeFjqmpxMNR8G_dT8z7j.pqtf5caZWRLl3qgT5ctbQcEtTvp%2BXaa%2Bq%2FyxV%2BnxhKA'
      },
      body: JSON.stringify({
        type: 'SendCRMOutreachMessage',
        account_id: account_id,
        joid: joid,
        send_msg: {
          prid: prid,
          to_email: to_email || 'tbennet2@gmail.com',
          to_name: to_name || '',
          from_email: 'timothy@findem.ai',
          from_name: 'Tim Bennett',
          platform: 1,
          subject: subject,
          body_html: body_html,
          body_text: body_html,
          cc_emails: []
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Send email API error: ${response.status}`, errorText);
      return res.status(response.status).json({ error: `Send API returned ${response.status}`, details: errorText });
    }

    const data = await response.json();
    console.log('✅ Email sent successfully for:', to_name);
    return res.json(data);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}
