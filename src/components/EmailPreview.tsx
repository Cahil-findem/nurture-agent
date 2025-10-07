import { useState, useEffect } from 'react';
import './EmailPreview.css';

interface EmailData {
  subject: string;
  content: string;
  preview_text: string;
  logoUrl?: string;
  companyName?: string;
  companyWebsite?: string;
  role?: string;
}

interface RoleEmailData {
  softwareEngineer: EmailData | null;
  marketingManager: EmailData | null;
  salesRepresentative: EmailData | null;
}

const EmailPreview: React.FC = () => {
  const [emailData, setEmailData] = useState<RoleEmailData>({
    softwareEngineer: null,
    marketingManager: null,
    salesRepresentative: null
  });
  const [currentRole, setCurrentRole] = useState<'softwareEngineer' | 'marketingManager' | 'salesRepresentative'>('softwareEngineer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateEmailContent();
  }, []);

  const generateEmailContent = async () => {
    try {
      // Get crawled data from localStorage
      const demoData = localStorage.getItem('demoSetupData');
      if (!demoData) {
        setLoading(false);
        return;
      }

      const parsedData = JSON.parse(demoData);
      const { crawledData } = parsedData;

      if (!crawledData) {
        setLoading(false);
        return;
      }

      // Check if emails were already generated
      if (parsedData.generatedEmails) {
        console.log('EmailPreview - Using pre-generated emails:', parsedData.generatedEmails);
        setEmailData(parsedData.generatedEmails);
        setLoading(false);
        return;
      }

      console.log('EmailPreview - Generating emails for all roles with data:', {
        companyName: parsedData.companyName,
        companyWebsite: parsedData.companyWebsite,
        logoUrl: crawledData.logo_url,
        blogPosts: crawledData.blog_posts,
        companyDescription: crawledData.company_summary || crawledData.about_text,
        toneOfVoice: crawledData.tone_of_voice_example,
        userName: parsedData.userName
      });

      const roles = [
        { key: 'softwareEngineer', name: 'Software Engineer' },
        { key: 'marketingManager', name: 'Marketing Manager' },
        { key: 'salesRepresentative', name: 'Sales Representative' }
      ];

      const emailPromises = roles.map(async (role) => {
        const response = await fetch('http://localhost:3004/api/generate-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyName: parsedData.companyName,
            companyWebsite: parsedData.companyWebsite,
            logoUrl: crawledData.logo_url,
            blogPosts: crawledData.blog_posts || [],
            companyDescription: crawledData.company_summary || crawledData.about_text || '',
            toneOfVoice: crawledData.tone_of_voice_example || '',
            userName: parsedData.userName,
            targetRole: role.name
          })
        });

        if (response.ok) {
          const generatedEmail = await response.json();
          return { role: role.key, email: { ...generatedEmail, role: role.name } };
        } else {
          console.error(`Failed to generate email for ${role.name}`);
          return { role: role.key, email: null };
        }
      });

      const results = await Promise.all(emailPromises);
      const newEmailData: RoleEmailData = {
        softwareEngineer: null,
        marketingManager: null,
        salesRepresentative: null
      };

      results.forEach(result => {
        if (result.email) {
          newEmailData[result.role as keyof RoleEmailData] = result.email;
        }
      });

      console.log('EmailPreview - Generated emails for all roles:', newEmailData);
      setEmailData(newEmailData);

      // Cache the generated emails
      const updatedDemoData = {
        ...parsedData,
        generatedEmails: newEmailData
      };
      localStorage.setItem('demoSetupData', JSON.stringify(updatedDemoData));

    } catch (error) {
      console.error('Error generating emails:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="email-preview">
        <div className="email-container">
          <div className="loading-message" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            color: '#666',
            fontSize: '16px'
          }}>
            Generating personalized email content...
          </div>
        </div>
      </div>
    );
  }

  const currentEmailData = emailData[currentRole];

  const roleLabels = {
    softwareEngineer: 'Software Engineer',
    marketingManager: 'Marketing Manager',
    salesRepresentative: 'Sales Representative'
  };

  const roles = Object.keys(roleLabels) as Array<keyof typeof roleLabels>;
  const currentIndex = roles.indexOf(currentRole);

  const navigateToRole = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % roles.length
      : (currentIndex - 1 + roles.length) % roles.length;
    setCurrentRole(roles[newIndex]);
  };

  if (!currentEmailData) {
    return (
      <div className="email-preview">
        <div className="email-container">
          <div className="error-message" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            color: '#666',
            fontSize: '16px'
          }}>
            No email data available. Please complete the demo setup first.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-preview">
      <div className="email-container">
        {/* Minimal Role Navigation Overlay */}
        <div className="role-navigation-overlay">
          <button
            className="nav-arrow-minimal"
            onClick={() => navigateToRole('prev')}
            aria-label="Previous role"
          >
            <span className="material-icons-round">chevron_left</span>
          </button>

          <div className="current-role-label">
            {roleLabels[currentRole]}
          </div>

          <button
            className="nav-arrow-minimal"
            onClick={() => navigateToRole('next')}
            aria-label="Next role"
          >
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>

        {/* Email Content */}
        <div className="email-content">
          {/* Hero Section */}
          <div className="email-section">
            <div className="hero-image-container">
              <img
                className="hero-image"
                src="/Hero.png"
                alt="Professional workspace"
              />
              {/* Company Logo Overlay */}
              <div className="logo-overlay">
                {currentEmailData.logoUrl ? (
                  <img
                    src={currentEmailData.logoUrl}
                    alt={`${currentEmailData.companyName} logo`}
                    className="overlay-logo"
                  />
                ) : (
                  <img
                    src="/Logo.png"
                    alt="Company logo"
                    className="overlay-logo"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Main Content - AI Generated */}
          <div className="email-section">
            <div className="content-block">
              <div
                className="email-body"
                dangerouslySetInnerHTML={{ __html: currentEmailData.content }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="email-divider">
            <div className="divider-line"></div>
          </div>

          {/* Footer */}
          <div className="email-footer">
            <div className="footer-logo">
              {currentEmailData.logoUrl ? (
                <img src={currentEmailData.logoUrl} alt={`${currentEmailData.companyName} footer logo`} style={{maxHeight: '21px'}} />
              ) : (
                <img src="/Logo.png" alt="Footer logo" style={{maxHeight: '21px'}} />
              )}
            </div>
            <div className="footer-divider"></div>
            <div className="footer-text">
              This email was sent to you because you are subscribed to our career newsletter.
            </div>
            <div className="footer-copyright">
              © 2024 {currentEmailData.companyName || 'Company'} Inc. All rights reserved.
            </div>
          </div>
        </div>

        {/* Fade Overlay */}
        <div className="fade-overlay"></div>
      </div>
    </div>
  );
};

export default EmailPreview;