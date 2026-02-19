export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { joid, prid } = req.body;

  if (!joid || !prid) {
    return res.status(400).json({ error: 'joid and prid are required' });
  }

  try {
    let resultData;

    // Step 1: Try smart endpoint (skips full processing if candidate already exists)
    console.log('📡 Step 1: Trying process-and-email for:', prid);
    const smartResponse = await fetch('https://kong-email-creator.vercel.app/api/process-and-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: prid })
    });

    console.log('📡 Step 1 response status:', smartResponse.status);

    if (smartResponse.ok) {
      resultData = await smartResponse.json();
      console.log('✅ Step 1 SUCCESS: Candidate already processed. Skipped full processing.');
      console.log('   → candidate:', JSON.stringify(resultData.candidate));
      console.log('   → email subject:', resultData.email?.subject);
      console.log('   → email body length:', resultData.email?.body?.length);
      console.log('   → has professional_summary:', !!resultData.professional_summary);
      console.log('   → blog_matches count:', resultData.blog_matches?.length);
    } else if (smartResponse.status === 404) {
      // Step 2: Candidate not processed yet — fetch profile from Findem
      console.log('📡 Step 2: Candidate not in Kong. Fetching profile from Findem...');
      const profileResponse = await fetch('https://search.findem.ai/pub/api/profile', {
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
          'Cache-Control': 'no-cache',
          'Cookie': 'connect.sid=s%3AQdluXlAv2wL_aEghi7mfTW-wWV6qtzN6.xV0Qhp5VhLirY%2FhMT7rFIJ9faJGVqRB3Ke7jybUWcWo; _csrf=w2vpD4dYhDkmUIius7Q6nkCP; f4m.sticky=v1e0578f19; __adroll_fpc=c6415d7c43262ad269430c843c7bfbb0-1759264841020; cookieyes-consent=consentid:WHRLbHhJZVJlTXR3b0F4MUpUQWNCZDRNbXRpTWNEcmE,consent:no,action:yes,necessary:yes,functional:no,analytics:no,performance:no,advertisement:no,other:no; ajs_anonymous_id=%22c72107e0-886b-4e13-88c8-5cb782099de3%22; initialTrafficSource=utm_src=google|utm_med=organic|utm_camp=(not set)|utm_trm=(not provided); __utmzzses=1; 3c7cdcb85f1d7be5_cfid=a5fca5d30cef6ddba4731cbf269e7c623c4d620451fb42d7591e7a1ed646e504734c3e0e42cf6b2ae25bd389ba48b0bdd1b5d1c785a7447928fe55a4a783ae53; intercom-device-id-lxdw5ft0=d107f80c-6531-48ac-ab43-99901305f064; _ga=GA1.1.1679878304.1767729887; _ga_3NFPTDY8P2=GS2.1.s1770150131$o15$g1$t1770150171$j20$l0$h0; f4m.account.domain=findem.ai; f4m.account.id=cam16rslteetipuobz1m2; intercom-session-lxdw5ft0=QTNSYWZ1b3VGZnJrdU1RcmtZMFN4TTNkdU1Zam0xZG1zbTM0TUQwc2hWR0xEOFFsL2VMeEhLUW9rMHQ4L0tNU2F5L1NDUEpTamhZUEkxeUwyQXhpVDBxaktHVlNpVTJ4bDdaZUgwZzBtL3M9LS1zL1FMUUhrSENsUi9lVndlbyt1cDB3PT0=--5e8770e86bce8d1e251050beb940f97004d1439c; fs_lua=1.1770450713357; fs_uid=#VB5PS#7c6359f8-db5b-41a3-8cba-c8c55fc931da:28083b9d-4a84-41e2-8a60-eed8a2c445ab:1770450713357::1#5bd9db6e#/1801686256; _csrf=LsCGhI6StjJrsLsMoRX8shRr; connect.sid=s%3Aij1VrGnsn7ONxNsp4pjWTIbbgup0VnMR.4Gj7LU7HdgWci18r9DYzVNZS8tHIqK8A9J2Bp%2BfnMn8'
        },
        body: JSON.stringify({
          detail: 'true',
          joid: joid,
          prids: [prid],
          bust_cache: false,
          type: 'Profiles'
        })
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error(`❌ Findem profile API error: ${profileResponse.status}`, errorText);
        return res.status(profileResponse.status).json({ error: `Findem API returned ${profileResponse.status}` });
      }

      const profileData = await profileResponse.json();
      const candidateProfile = profileData[prid] || Object.values(profileData)[0];
      candidateProfile.ref = prid;
      console.log('✅ Profile fetched:', candidateProfile?.candidate?.full_name);

      // Step 3: Full processing via process-candidate
      console.log('📡 Step 3: Processing candidate in Kong...');
      const processResponse = await fetch('https://kong-email-creator.vercel.app/api/process-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate: candidateProfile })
      });

      if (!processResponse.ok) {
        const errorText = await processResponse.text();
        console.error(`❌ process-candidate API error: ${processResponse.status}`, errorText);
        return res.status(processResponse.status).json({ error: `process-candidate API returned ${processResponse.status}` });
      }

      resultData = await processResponse.json();
      console.log('✅ Step 3 SUCCESS: Full processing complete.');
      console.log('   → candidate:', JSON.stringify(resultData.candidate));
      console.log('   → email subject:', resultData.email?.subject);
      console.log('   → email body length:', resultData.email?.body?.length);
      console.log('   → has professional_summary:', !!resultData.professional_summary);
      console.log('   → blog_matches count:', resultData.blog_matches?.length);
      console.log('   → full response keys:', Object.keys(resultData));
    } else {
      const errorText = await smartResponse.text();
      console.error(`❌ process-and-email error: ${smartResponse.status}`, errorText);
      return res.status(smartResponse.status).json({ error: `API returned ${smartResponse.status}` });
    }

    // Step 4: Fetch email record ID from Kong generated_emails table
    console.log('📡 Step 4: Fetching email record ID from Kong for candidate_id:', prid);
    let emailRecordId = null;
    try {
      const emailsUrl = `https://kong-email-creator.vercel.app/api/emails?candidate_id=${encodeURIComponent(prid)}`;
      console.log('   → GET', emailsUrl);
      const emailsRes = await fetch(emailsUrl);
      console.log('   → Response status:', emailsRes.status);
      if (emailsRes.ok) {
        const emailsData = await emailsRes.json();
        console.log('   → Emails found:', emailsData.emails?.length || 0);
        console.log('   → Full response:', JSON.stringify(emailsData));
        if (emailsData.emails?.length > 0) {
          emailRecordId = emailsData.emails[0].id;
          console.log('✅ Step 4 SUCCESS: Email record ID:', emailRecordId);
        } else {
          console.log('⚠️ Step 4: No emails found in generated_emails table for this candidate');
        }
      } else {
        const errorText = await emailsRes.text();
        console.error('❌ Step 4: Emails API error:', emailsRes.status, errorText);
      }
    } catch (e) {
      console.warn('⚠️ Step 4 FAILED:', e.message);
    }

    const finalResponse = {
      candidate: {
        full_name: resultData.candidate?.name || resultData.candidate?.full_name,
        title: resultData.candidate?.title
      },
      email: resultData.email,
      emailRecordId,
      professional_summary: resultData.professional_summary,
      blog_matches: resultData.blog_matches
    };
    console.log('📤 Final response to frontend:', JSON.stringify({
      candidate: finalResponse.candidate,
      emailRecordId: finalResponse.emailRecordId,
      emailSubject: finalResponse.email?.subject,
      emailBodyLength: finalResponse.email?.body?.length
    }));
    return res.json(finalResponse);
  } catch (error) {
    console.error('❌ Error in generate pipeline:', error.message);
    return res.status(500).json({ error: 'Failed to generate message', details: error.message });
  }
}
