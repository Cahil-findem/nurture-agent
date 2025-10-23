import { useState, useEffect } from 'react';
import './OutreachContract.css';

interface OutreachContractProps {
  onNavigate?: (page: 'demo-setup' | 'recipe1' | 'recipe-loader' | 'recipe2' | 'chat' | 'outreach-contract') => void;
}

interface CandidateEmail {
  name: string;
  role: string;
  company: string;
  emailBody: string;
  emailSubject?: string;
}

const OutreachContract: React.FC<OutreachContractProps> = ({ onNavigate }) => {
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const [candidates, setCandidates] = useState<CandidateEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadEmailData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.main-content');
      if (scrollContainer) {
        setIsScrolled(scrollContainer.scrollTop > 0);
      }
    };

    const scrollContainer = document.querySelector('.main-content');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const loadEmailData = () => {
    try {
      const preGeneratedData = localStorage.getItem('preGeneratedEmailData');

      if (preGeneratedData) {
        const parsedData = JSON.parse(preGeneratedData);
        console.log('OutreachContract - Loaded pre-generated data:', parsedData);

        const loadedCandidates: CandidateEmail[] = [];

        // Check if we have role-specific email data
        if (parsedData.roleEmails) {
          // Load Jacob Wang
          if (parsedData.roleEmails.jacobWang && parsedData.roleEmails.jacobWang.email) {
            const jacobData = parsedData.roleEmails.jacobWang;
            loadedCandidates.push({
              name: jacobData.candidate?.name || "Jacob Wang",
              role: jacobData.candidate?.current_title || "Senior Software Engineer",
              company: jacobData.candidate?.company || "Google",
              emailBody: jacobData.email.body || '',
              emailSubject: jacobData.email.subject || ''
            });
          }

          // Load Kristina Wong
          if (parsedData.roleEmails.kristinaWong && parsedData.roleEmails.kristinaWong.email) {
            const kristinaData = parsedData.roleEmails.kristinaWong;
            loadedCandidates.push({
              name: kristinaData.candidate?.name || "Kristina Wong",
              role: kristinaData.candidate?.current_title || "Senior Product Designer",
              company: kristinaData.candidate?.company || "Vanta",
              emailBody: kristinaData.email.body || '',
              emailSubject: kristinaData.email.subject || ''
            });
          }

          // Load Colin Farnan
          if (parsedData.roleEmails.colinFarnan && parsedData.roleEmails.colinFarnan.email) {
            const colinData = parsedData.roleEmails.colinFarnan;
            loadedCandidates.push({
              name: colinData.candidate?.name || "Colin Farnan",
              role: colinData.candidate?.current_title || "Account Executive",
              company: colinData.candidate?.company || "Datadog",
              emailBody: colinData.email.body || '',
              emailSubject: colinData.email.subject || ''
            });
          }

          // Load Kevin Courtney
          if (parsedData.roleEmails.kevinCourtney && parsedData.roleEmails.kevinCourtney.email) {
            const kevinData = parsedData.roleEmails.kevinCourtney;
            loadedCandidates.push({
              name: kevinData.candidate?.name || "Kevin Courtney",
              role: kevinData.candidate?.current_title || "Enterprise Account Executive",
              company: kevinData.candidate?.company || "Ivo",
              emailBody: kevinData.email.body || '',
              emailSubject: kevinData.email.subject || ''
            });
          }
        }

        // If we successfully loaded candidates, use them
        if (loadedCandidates.length > 0) {
          setCandidates(loadedCandidates);
          console.log('OutreachContract - Loaded candidates from API:', loadedCandidates);
        } else {
          // Fallback to default candidates if API data not available
          console.log('OutreachContract - No API data found, using fallback');
          setCandidates(getDefaultCandidates());
        }
      } else {
        // No pre-generated data, use defaults
        console.log('OutreachContract - No pre-generated data, using defaults');
        setCandidates(getDefaultCandidates());
      }
    } catch (error) {
      console.error('OutreachContract - Error loading email data:', error);
      setCandidates(getDefaultCandidates());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCandidates = (): CandidateEmail[] => {
    return [
      {
        name: "Jacob Wang",
        role: "Senior Software Engineer",
        company: "Google",
        emailBody: `Hi Jacob,

I came across your profile and was impressed by your extensive experience with distributed systems at Google and Firebase. Your work on high-availability, high-throughput systems really stood out.

We're currently looking for talented engineers who have deep expertise in cloud technologies and distributed systems. Given your background with Java, Python, C++, and your hands-on experience with Docker and Kubernetes, I thought you might be interested in some of the opportunities we have.

I'd love to connect and share more about what we're working on. Would you be open to a brief conversation?`
      },
      {
        name: "Kristina Wong",
        role: "Senior Product Designer",
        company: "Vanta",
        emailBody: `Hi Kristina,

I was really impressed by your design systems work at Vanta and your extensive experience leading UX design teams at companies like Medallia and Symantec.

Your expertise in Figma, accessibility, and creating design systems that drive consistency across products is exactly what we value. I noticed your focus on data-rich layouts and modern, clean interfaces - this aligns perfectly with some of the challenges we're tackling.

I'd love to discuss some opportunities where your skills in visual design and design systems could make a real impact. Are you open to a conversation?`
      },
      {
        name: "Colin Farnan",
        role: "Account Executive",
        company: "Datadog",
        emailBody: `Hi Colin,

I was impressed by your account executive experience at Datadog and your track record in managing major accounts. Your expertise in driving business growth and building strong client relationships really caught my attention.

We're looking for talented sales professionals who understand the enterprise market and can help drive our business forward. Given your background in account management and your understanding of the tech industry, I thought you might be interested in exploring opportunities with us.

I'd love to connect and discuss how your skills could contribute to our team's success. Would you be open to a conversation?`
      },
      {
        name: "Kevin Courtney",
        role: "Enterprise Account Executive",
        company: "Ivo",
        emailBody: `Hi Kevin,

I came across your profile and was impressed by your extensive experience in enterprise SaaS sales, particularly your achievements at Lever where you made President's Club multiple years ('19, '21, '22) and your Top 10% performance at LinkedIn.

Your track record of consistently exceeding quota (171% at LinkedIn, 160% at Insight Global) and your expertise in AI-powered contract solutions at Ivo demonstrates both strategic thinking and execution excellence. Your experience spanning Fortune 500 enterprises and global teams is particularly noteworthy.

I'd love to discuss some opportunities where your enterprise sales expertise and proven track record could make a significant impact. Would you be open to a conversation?`
      }
    ];
  };

  const formatEmailBody = (body: string): string => {
    // Format email body similar to EmailPreview component
    return body
      .replace(/\n\n/g, '</p><p>')  // Convert double newlines to paragraph breaks
      .replace(/\n/g, '<br>')        // Convert single newlines to line breaks
      .replace(/^/, '<p>')           // Add opening paragraph tag at start
      .replace(/$/, '</p>')          // Add closing paragraph tag at end
      // Convert markdown-style links [text](url) to HTML links
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" style="color: #4599FA; text-decoration: underline;">$1</a>')
      // Convert bare URLs to clickable links
      .replace(/(^|[^"])(https?:\/\/[^\s<]+)(?![^<]*<\/a>)/g, '$1<a href="$2" target="_blank" style="color: #4599FA; text-decoration: underline;">$2</a>');
  };

  const currentCandidate = candidates[currentCandidateIndex] || getDefaultCandidates()[0];
  const formattedEmailBody = formatEmailBody(currentCandidate.emailBody);

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (candidates.length === 0) return;

    if (direction === 'next') {
      setCurrentCandidateIndex((prev) => (prev + 1) % candidates.length);
    } else {
      setCurrentCandidateIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
    }
  };

  const handleChatClick = () => {
    // Parse first name from full name
    const fullName = currentCandidate?.name || 'Unknown';
    const firstName = fullName.split(' ')[0];

    // Get the current role key based on candidate index
    const roleKeys = ['jacobWang', 'kristinaWong', 'colinFarnan', 'kevinCourtney'];
    const currentRoleKey = roleKeys[currentCandidateIndex];

    // Get interests and job preferences from the stored email data (from Kong API)
    let professionalInterests = [
      'career development topics',
      'back-end software engineering',
      'cloud computing',
      'new java releases'
    ]; // fallback

    let jobPreferences = {
      titles: ['Software Engineer'],
      locations: ['Austin, TX', 'Remote'],
      levelSeniority: 'Senior',
      jobSpecifics: [],
      company: 'Kong'
    }; // fallback

    try {
      const preGeneratedData = localStorage.getItem('preGeneratedEmailData');
      if (preGeneratedData) {
        const parsedData = JSON.parse(preGeneratedData);

        // Try to get data from role-specific data for the current role
        if (parsedData.roleEmails && currentRoleKey && parsedData.roleEmails[currentRoleKey]) {
          const roleData = parsedData.roleEmails[currentRoleKey];

          // Parse interests
          if (roleData.interests) {
            const interestsText = roleData.interests;
            console.log(`Getting interests for role ${currentRoleKey}:`, interestsText);

            // Parse the interests text (format: "• Interest 1\n• Interest 2\n...")
            const interestLines = interestsText.split('\n')
              .filter((line: string) => line.trim().startsWith('•'))
              .map((line: string) => line.replace('•', '').trim())
              .filter((line: string) => line.length > 0);

            if (interestLines.length > 0) {
              professionalInterests = interestLines;
              console.log(`Using API interests for ${fullName} in chat:`, professionalInterests);
            }
          }

          // Parse job preferences
          if (roleData.job_preferences) {
            const jobPrefText = roleData.job_preferences;
            console.log(`Getting job preferences for role ${currentRoleKey}:`, jobPrefText);

            const lines = jobPrefText.split('\n');
            const parsedJobPrefs = { ...jobPreferences };

            lines.forEach((line: string) => {
              const trimmed = line.trim();
              if (trimmed.startsWith('Job Titles:')) {
                const titlesText = trimmed.replace('Job Titles:', '').trim();
                const titles = titlesText.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
                if (titles.length > 0) {
                  parsedJobPrefs.titles = titles;
                }
              } else if (trimmed.startsWith('Location:')) {
                const locationText = trimmed.replace('Location:', '').trim();
                if (locationText.length > 0) {
                  parsedJobPrefs.locations = [locationText];
                }
              } else if (trimmed.startsWith('Seniority:')) {
                const seniorityText = trimmed.replace('Seniority:', '').trim();
                if (seniorityText.length > 0) {
                  parsedJobPrefs.levelSeniority = seniorityText;
                }
              }
            });

            jobPreferences = parsedJobPrefs;
            console.log(`Using API job preferences for ${fullName} in chat:`, jobPreferences);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing data from API:', error);
    }

    // Store candidate information for the chat using data from Kong API
    const candidateData = {
      name: fullName,
      firstName: firstName,
      jobPreferences: jobPreferences,
      professionalInterests: professionalInterests,
      timestamp: Date.now()
    };

    console.log('Using dynamic candidate data:', candidateData);

    // Save candidate data to localStorage
    try {
      localStorage.setItem('candidateData', JSON.stringify(candidateData));
    } catch (error) {
      console.error('Error saving candidate data:', error);
    }

    // Navigate to Chat page
    onNavigate?.('chat');
  };

  if (loading) {
    return (
      <div className="outreach-contract">
        <div className="content-wrapper">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            color: '#666',
            fontSize: '16px'
          }}>
            Loading email preview...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="outreach-contract">
      <div className="content-wrapper">
        {/* Sticky Header Container */}
        <div className={`sticky-header ${isScrolled ? 'scrolled' : ''}`}>
          {/* Header */}
          <div className="title-section">
            <div className="title-with-logo">
              <img
                className="x-logo"
                src="/AI%20Loader.gif"
                alt="AI Logo"
              />
              <h1 className="page-title">
                All set! Ready for me to start nurturing?
              </h1>
            </div>
            <div className="header-buttons">
              <button className="header-btn-secondary">
                Request Changes
              </button>
              <button className="header-btn-primary">
                Activate Cleo
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="header-divider"></div>
        </div>

        {/* Two Column Layout */}
        <div className="two-column-layout">
          {/* Left Column - Email Preview */}
          <div className="left-column">
            <div className="email-preview-card">
              {/* Email Content */}
              <div className="email-content">
                {/* Hero Section */}
                <div className="hero-section">
                  <div className="hero-container">
                    <div className="hero-image-wrapper">
                      <img
                        src="/Email%20image.png"
                        alt="Hero"
                        className="hero-image"
                      />
                      {/* Navigation Chip */}
                      <div className="hero-chip">
                        <button className="chip-arrow" onClick={() => handleNavigate('prev')}>
                          <span className="material-icons-round">chevron_left</span>
                        </button>
                        <span>{currentCandidate.name}: {currentCandidate.role}</span>
                        <button className="chip-arrow" onClick={() => handleNavigate('next')}>
                          <span className="material-icons-round">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email Text */}
                  <div className="email-text-section">
                    <h2 className="email-heading">{currentCandidate.name.split(' ')[0]}, thought of you for this role</h2>
                    <div
                      className="email-body-text"
                      dangerouslySetInnerHTML={{ __html: formattedEmailBody }}
                    />
                  </div>

                  {/* CTA Section */}
                  <div className="cta-section">
                    <div className="cta-divider"></div>
                    <p className="cta-text">
                      Not quite what you were looking for? Chat to Cleo to fine-tune what content and job opportunities we share with you!
                    </p>
                    <button className="cta-button" onClick={handleChatClick}>
                      <span className="material-icons-round">auto_awesome</span>
                      <span>Speak to Cleo</span>
                    </button>
                  </div>
                </div>

                {/* Footer Dividers */}
                <div className="footer-dividers">
                  <div className="footer-divider"></div>
                  <div className="footer-divider"></div>
                  <div className="footer-divider"></div>
                </div>

                {/* Footer */}
                <div className="email-footer">
                  <img src="/Kong_Footer_Logo.png" alt="Kong Logo" className="footer-logo" />
                  <div className="footer-divider-line"></div>
                  <p className="footer-text">
                    This email was sent to you because you are subscribed to the career newsletter.
                  </p>
                  <div className="footer-copyright">
                    <p>© 2024 Logoipsum Inc. All rights reserved.</p>
                    <p>Redwood City, California, USA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contract Cards */}
          <div className="right-column">
            {/* Personal */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">auto_awesome</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Personal</p>
                <p className="contract-description">
                  Recognize career milestones and work anniversaries to create authentic, <strong>personal connections</strong>.
                </p>
              </div>
            </div>

            {/* Audience */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">sports_score</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Audience</p>
                <p className="contract-description">
                  Nurture your <strong>entire talent network</strong> to grow a long-term candidate pipeline.
                </p>
              </div>
            </div>

            {/* Cadence */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">email</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Cadence</p>
                <p className="contract-description">
                  Reach out at least every <strong>3 months</strong> with content from your blog and new openings in your ATS.
                </p>
              </div>
            </div>

            {/* Updates */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">schedule</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Updates</p>
                <p className="contract-description">
                  Get a <strong>weekly progress report every Monday</strong> with response rates and engagement highlights.
                </p>
              </div>
            </div>

            {/* Control */}
            <div className="contract-card">
              <div className="contract-icon-wrapper">
                <span className="material-icons-round">handshake</span>
              </div>
              <div className="contract-content">
                <p className="contract-title">Control</p>
                <p className="contract-description">
                  Respect your <strong>no-contact list</strong> and confirm changes with you before updating the approach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutreachContract;
