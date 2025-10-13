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
      // Get demo data from localStorage (optional, for fallback logo/company info)
      const demoData = localStorage.getItem('demoSetupData');
      let parsedData = null;
      let crawledData = null;
      
      if (demoData) {
        parsedData = JSON.parse(demoData);
        crawledData = parsedData.crawledData;
        
        // Check if emails were already generated with old system
        if (parsedData.generatedEmails) {
          console.log('EmailPreview - Using pre-generated emails:', parsedData.generatedEmails);
          setEmailData(parsedData.generatedEmails);
          setLoading(false);
          return;
        }
      }

      console.log('EmailPreview - Generating emails using Kong API');

      const roles = [
        { key: 'softwareEngineer', name: 'Software Engineer' },
        { key: 'marketingManager', name: 'Marketing Manager' },
        { key: 'salesRepresentative', name: 'Sales Representative' }
      ];

      // Call the new API once and use the same email for all roles
      const response = await fetch('https://kong-email-creator.vercel.app/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate_id: "68d193fecb73815f93cc0e45"
        })
      });

      if (!response.ok) {
        console.error('Failed to generate email from new API');
        return;
      }

      const generatedEmailResponse = await response.json();
      console.log('New API response:', generatedEmailResponse);

      // Extract subject and body from the new API response format
      const baseEmailData = {
        subject: generatedEmailResponse.email.subject,
        content: generatedEmailResponse.email.body,
        preview_text: generatedEmailResponse.email.subject, // Use subject as preview for now
        logoUrl: crawledData?.logo_url || '/Logo.png', // Fallback to default logo
        companyName: parsedData?.companyName || 'Kong', // Fallback to Kong
        companyWebsite: parsedData?.companyWebsite || 'https://konghq.com'
      };

      // Use the same email data for all roles
      const emailPromises = roles.map(async (role) => {
        return { 
          role: role.key, 
          email: { 
            ...baseEmailData, 
            role: role.name 
          } 
        };
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