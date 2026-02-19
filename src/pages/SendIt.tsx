import { useState } from 'react';
import './SendIt.css';

interface Profile {
  ref: string;
  candidate: {
    full_name: string;
    title?: string;
  };
}

interface GeneratedData {
  fullName: string;
  title: string;
  emailSubject: string;
  emailBody: string;
  emailRecordId?: number;
}

interface SendItProps {
  onNavigate?: (page: string) => void;
}

const SendIt: React.FC<SendItProps> = () => {
  const [joid, setJoid] = useState('66b10678b9348580444bf8a5');
  const [tcId, setTcId] = useState('6986d59d7a0a564ebef48cde');
  const [accountId, setAccountId] = useState('cam16rslteetipuobz1m2');
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [generatedMessages, setGeneratedMessages] = useState<Record<string, GeneratedData>>({});
  const [generatingRefs, setGeneratingRefs] = useState<Record<string, boolean>>({});
  const [viewingRef, setViewingRef] = useState<string | null>(null);
  const [sendingRef, setSendingRef] = useState<string | null>(null);
  const [sentRefs, setSentRefs] = useState<Record<string, boolean>>({});
  const [toEmails, setToEmails] = useState<Record<string, string>>({});
  const [emailOptions, setEmailOptions] = useState<Record<string, string[]>>({});

  const fetchProfiles = async (_joid: string, tcId: string, accountId: string): Promise<Profile[]> => {
    console.log('[SUBMIT] 1/2 Fetching profiles from Findem...', { tc_id: tcId, account_id: accountId });
    const params = new URLSearchParams({ tc_id: tcId, account_id: accountId });
    const response = await fetch(`/api/sendit/profiles?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch profiles: ${response.status}`);
    }

    const data = await response.json();
    console.log('[SUBMIT] 1/2 Profiles fetched:', data.length, 'candidates');
    return data;
  };

  const generateMessage = async (ref: string): Promise<GeneratedData> => {
    console.log('[GENERATE] 1/2 Calling /api/sendit/generate with:', { joid: joid.trim(), prid: ref });

    const response = await fetch('/api/sendit/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ joid: joid.trim(), prid: ref })
    });

    console.log('[GENERATE] 1/2 Response status:', response.status);
    if (!response.ok) {
      console.error('[GENERATE] 1/2 ❌ Generate API error:', response.status);
      throw new Error(`Failed to generate message: ${response.status}`);
    }

    const data = await response.json();
    console.log('[GENERATE] 1/2 ✅ Response received:');
    console.log('   → candidate:', JSON.stringify(data?.candidate));
    console.log('   → email subject:', data?.email?.subject);
    console.log('   → email body length:', data?.email?.body?.length);
    console.log('   → emailRecordId:', data?.emailRecordId);
    console.log('   → has professional_summary:', !!data?.professional_summary);
    console.log('   → blog_matches count:', data?.blog_matches?.length);

    return {
      fullName: data?.candidate?.full_name || 'Unknown',
      title: data?.candidate?.title || 'No title available',
      emailSubject: data?.email?.subject || '',
      emailBody: data?.email?.body || '',
      emailRecordId: data?.emailRecordId || undefined
    };
  };

  const checkExistingEmail = async (ref: string, fullName: string, title?: string) => {
    console.log('[SUBMIT] 2/2 Checking Kong for existing email:', ref, fullName);
    try {
      const response = await fetch(`/api/sendit/emails?candidate_id=${encodeURIComponent(ref)}`);
      console.log('[SUBMIT] 2/2 Kong emails response status:', response.status);
      if (!response.ok) {
        console.log('[SUBMIT] 2/2 No stored emails (non-OK response) for:', ref);
        return;
      }

      const data = await response.json();
      console.log('[SUBMIT] 2/2 Kong emails response:', JSON.stringify(data));
      if (data.emails && data.emails.length > 0) {
        const latestEmail = data.emails[0];
        console.log('[SUBMIT] 2/2 ✅ Found existing email for:', fullName, '| Record ID:', latestEmail.id, '| Subject:', latestEmail.email_subject);
        setGeneratedMessages(prev => ({
          ...prev,
          [ref]: {
            fullName,
            title: title || '',
            emailSubject: latestEmail.email_subject || '',
            emailBody: latestEmail.email_html || '',
            emailRecordId: latestEmail.id
          }
        }));
        fetchContacts(ref);
      } else {
        console.log('[SUBMIT] 2/2 No stored emails found for:', ref);
      }
    } catch (error) {
      console.error('[SUBMIT] 2/2 Error checking existing emails for:', ref, error);
    }
  };

  const handleSubmit = async () => {
    if (!joid.trim() || !tcId.trim() || !accountId.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setProfiles([]);
    setGeneratedMessages({});
    setViewingRef(null);

    try {
      const results = await fetchProfiles(joid.trim(), tcId.trim(), accountId.trim());
      setProfiles(results);

      // Check Kong for existing emails for each candidate
      results.forEach(profile => {
        checkExistingEmail(profile.ref, profile.candidate.full_name, profile.candidate.title);
      });
    } catch (error) {
      console.error('Error fetching profiles:', error);
      alert('Failed to fetch profiles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async (ref: string): Promise<void> => {
    try {
      const response = await fetch('/api/sendit/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joid: joid.trim(), refs: [ref] })
      });

      if (!response.ok) {
        console.error('❌ Contacts API error:', response.status);
        return;
      }

      const data = await response.json();
      console.log('📇 Contacts response:', data);

      const contactData = data[ref];
      if (contactData?.without_override) {
        const personalEmails = contactData.without_override.personal_emails || [];
        const highPrecedenceEmail = contactData.without_override.high_precedence_emails?.[0];

        setEmailOptions(prev => ({ ...prev, [ref]: personalEmails }));

        const defaultEmail = highPrecedenceEmail || personalEmails[0] || 'tbennet2@gmail.com';
        setToEmails(prev => ({ ...prev, [ref]: defaultEmail }));
      }
    } catch (error) {
      console.error('Error fetching contacts for:', ref, error);
    }
  };

  const handleGenerate = async (ref: string) => {
    console.log('[GENERATE] Starting generate for:', ref);
    setGeneratingRefs(prev => ({ ...prev, [ref]: true }));

    try {
      const data = await generateMessage(ref);
      console.log('[GENERATE] Storing in state:', { fullName: data.fullName, emailRecordId: data.emailRecordId, hasBody: !!data.emailBody });
      setGeneratedMessages(prev => ({ ...prev, [ref]: data }));
      setToEmails(prev => ({ ...prev, [ref]: 'tbennet2@gmail.com' }));

      // Fetch contact emails for the dropdown
      console.log('[GENERATE] 2/2 Fetching contacts for:', ref);
      fetchContacts(ref);
    } catch (error) {
      console.error('[GENERATE] ❌ Error generating message for:', ref, error);
      alert('Failed to generate message. Please try again.');
    } finally {
      setGeneratingRefs(prev => ({ ...prev, [ref]: false }));
    }
  };

  const handleView = (ref: string) => {
    setViewingRef(ref);
  };

  const handleSend = async (ref: string) => {
    const data = generatedMessages[ref];
    if (!data) return;

    setSendingRef(ref);
    console.log('[SEND] 1/2 Sending email via Findem for:', data.fullName, '| PRID:', ref);
    console.log('[SEND] 1/2 → to_email:', toEmails[ref] || 'tbennet2@gmail.com');
    console.log('[SEND] 1/2 → subject:', data.emailSubject);
    console.log('[SEND] 1/2 → emailRecordId in state:', data.emailRecordId);

    try {
      const response = await fetch('/api/sendit/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId.trim(),
          joid: joid.trim(),
          prid: ref,
          subject: data.emailSubject,
          body_html: data.emailBody,
          to_name: data.fullName,
          to_email: toEmails[ref] || 'tbennet2@gmail.com'
        })
      });

      console.log('[SEND] 1/2 Findem send response status:', response.status);
      if (!response.ok) {
        console.error('[SEND] 1/2 ❌ Send API error:', response.status);
        throw new Error(`Failed to send: ${response.status}`);
      }

      const result = await response.json();
      console.log('[SEND] 1/2 ✅ Findem send success:', result);
      setSentRefs(prev => ({ ...prev, [ref]: true }));

      // Update email status in Kong
      const emailRecordId = generatedMessages[ref]?.emailRecordId;
      console.log('[SEND] 2/2 Updating Kong email status. emailRecordId:', emailRecordId);
      if (emailRecordId) {
        try {
          const statusResponse = await fetch('/api/sendit/email-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailId: emailRecordId, status: 'sent' })
          });
          const statusResult = await statusResponse.json();
          console.log('[SEND] 2/2 ✅ Kong email status update response:', statusResult);
        } catch (e) {
          console.error('[SEND] 2/2 ❌ Failed to update email status in Kong:', e);
        }
      } else {
        console.warn('[SEND] 2/2 ⚠️ No emailRecordId found — cannot update status in Kong');
      }
    } catch (error) {
      console.error('[SEND] ❌ Error sending email for:', ref, error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingRef(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const viewingData = viewingRef ? generatedMessages[viewingRef] : null;

  return (
    <div className="sendit">
      <div className="sendit-container">
        <div className="sendit-content">
          {/* Header */}
          <div className="sendit-header">
            <h1 className="sendit-title">Send It</h1>
            <p className="sendit-subtitle">
              Enter the required IDs to fetch candidate profiles
            </p>
          </div>

          {/* Form */}
          <div className="sendit-form">
            <div className="form-field">
              <div className="field-label-container">
                <label className="field-label">JOID</label>
              </div>
              <div className="field-input-container">
                <div className="field-input-wrapper">
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Enter JOID"
                    value={joid}
                    onChange={(e) => setJoid(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>

            <div className="form-field">
              <div className="field-label-container">
                <label className="field-label">TC_ID</label>
              </div>
              <div className="field-input-container">
                <div className="field-input-wrapper">
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Enter TC_ID"
                    value={tcId}
                    onChange={(e) => setTcId(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>

            <div className="form-field">
              <div className="field-label-container">
                <label className="field-label">Account ID</label>
              </div>
              <div className="field-input-container">
                <div className="field-input-wrapper">
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Enter Account ID"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="sendit-actions">
            <button
              className="save-button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <span className="save-button-text">
                {isLoading ? 'Fetching...' : 'Submit'}
              </span>
            </button>
          </div>

          {/* Results: Table + Email Viewer */}
          {profiles.length > 0 && (
            <div className="sendit-results-layout">
              {/* Table */}
              <div className="sendit-results">
                <table className="sendit-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Candidate Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => (
                      <tr key={profile.ref} className={viewingRef === profile.ref ? 'sendit-row-active' : ''}>
                        <td>{profile.ref}</td>
                        <td>{profile.candidate.full_name}</td>
                        <td className="sendit-actions-cell">
                          <button
                            className="sendit-action-btn sendit-generate-btn"
                            onClick={() => handleGenerate(profile.ref)}
                            disabled={generatingRefs[profile.ref] || !!generatedMessages[profile.ref]}
                          >
                            {generatingRefs[profile.ref] ? 'Generating...' : generatedMessages[profile.ref] ? 'Generated' : 'Generate'}
                          </button>
                          <button
                            className="sendit-action-btn sendit-view-btn"
                            onClick={() => handleView(profile.ref)}
                            disabled={!generatedMessages[profile.ref]}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Email Viewer */}
              <div className="sendit-email-viewer">
                {viewingData && viewingRef ? (
                  <div className="sendit-email-plain">
                    <button
                      className="sendit-send-btn"
                      onClick={() => handleSend(viewingRef)}
                      disabled={sendingRef === viewingRef || sentRefs[viewingRef]}
                    >
                      {sendingRef === viewingRef ? 'Sending...' : sentRefs[viewingRef] ? 'Sent' : 'Send'}
                    </button>
                    <p><strong>Name:</strong> {viewingData.fullName}</p>
                    <div className="sendit-email-field">
                      <strong>Email:</strong>
                      {emailOptions[viewingRef] && emailOptions[viewingRef].length > 0 ? (
                        <select
                          className="sendit-email-select"
                          value={toEmails[viewingRef] || ''}
                          onChange={(e) => setToEmails(prev => ({ ...prev, [viewingRef]: e.target.value }))}
                        >
                          {emailOptions[viewingRef].map((email) => (
                            <option key={email} value={email}>{email}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="email"
                          className="sendit-email-input"
                          value={toEmails[viewingRef] || ''}
                          onChange={(e) => setToEmails(prev => ({ ...prev, [viewingRef]: e.target.value }))}
                        />
                      )}
                    </div>
                    <p><strong>Title:</strong> {viewingData.title}</p>
                    {viewingData.emailSubject && (
                      <p><strong>Subject:</strong> {viewingData.emailSubject}</p>
                    )}
                    {viewingData.emailBody && (
                      <>
                        <hr style={{ border: 'none', borderTop: '1px solid #DCDFEA', margin: '16px 0' }} />
                        <div
                          className="sendit-email-body"
                          dangerouslySetInnerHTML={{ __html: viewingData.emailBody }}
                        />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="sendit-email-placeholder">
                    <span className="material-icons-round" style={{ fontSize: '48px', color: '#DCDFEA' }}>
                      email
                    </span>
                    <p>Generate a message and click View to preview it here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendIt;
