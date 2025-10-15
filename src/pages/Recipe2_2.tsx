import { useState, useEffect } from 'react';
import EmailPreview from '../components/EmailPreview';
import InteractionContract from '../components/InteractionContract';
import './Recipe2_2.css';

interface ColorSwatch {
  color: string;
  hex: string;
}

interface BrandAsset {
  id: string;
  url: string;
  name?: string;
}

interface Recipe2_2Props {
  onNavigate?: (page: 'demo-setup' | 'recipe1' | 'recipe-loader' | 'recipe2' | 'recipe2_2' | 'chat') => void;
}

const Recipe2_2: React.FC<Recipe2_2Props> = ({ onNavigate }) => {
  // const [logoFile, setLogoFile] = useState<File | null>(null);
  // const [logoUrl, setLogoUrl] = useState<string>('/Logo.png');
  const [_colors, setColors] = useState<ColorSwatch[]>([
    { color: '#4552F6', hex: '#4599FA' },
    { color: '#A9D1FF', hex: '#A9D1FF' },
    { color: '#6ED69B', hex: '#6ED69B' },
    { color: '#8BEFB6', hex: '#8BEFB6' }
  ]);
  const [_brandAssets] = useState<BrandAsset[]>([
    { id: 'asset-1', url: '/Brand%20Asset%2001.png', name: 'Woman in red beanie' },
    { id: 'asset-2', url: '/Brand%20Asset%2002.png', name: 'Mountain landscape' },
    { id: 'asset-3', url: '/Brand%20Asset%2003.png', name: 'Coastal cliffs' },
    { id: 'asset-4', url: '/Brand%20Asset%2004.png', name: 'Red surface texture' }
  ]);
  const [_companyDescription, setCompanyDescription] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer malesuada, lacus vel tristique fermentum, orci augue elementum nisi, ac porttitor mauris est non risus. Aenean sit amet sapien vitae lectus cursus iaculis at ac neque. Sed non leo euismod, sagittis libero eget, sollicitudin nulla.'
  );
  const [_toneOfVoice, setToneOfVoice] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer malesuada, lacus vel tristique fermentum, orci augue elementum nisi, ac porttitor mauris est non risus. Aenean sit amet sapien vitae lectus cursus iaculis at ac neque. Sed non leo euismod, sagittis libero eget, sollicitudin nulla.'
  );
  // const [previewMode, setPreviewMode] = useState<'preview' | 'edit'>('preview');

  // Load crawled data on component mount
  useEffect(() => {
    const demoData = localStorage.getItem('demoSetupData');
    if (demoData) {
      try {
        const parsedData = JSON.parse(demoData);
        console.log('Recipe2_2 - Loaded demo data:', parsedData);

        if (parsedData.crawledData) {
          const { crawledData } = parsedData;
          console.log('Recipe2_2 - Crawled data:', crawledData);

          // Update logo if available
          // if (crawledData.logo_url) {
          //   console.log('Recipe2_2 - Setting logo URL:', crawledData.logo_url);
          //   setLogoUrl(crawledData.logo_url);
          // } else {
          //   console.log('Recipe2_2 - No logo URL found in crawled data');
          // }

          // Update color palette if brand colors are available
          if (crawledData.brand_colors && crawledData.brand_colors.length > 0) {
            console.log('Recipe2_2 - Setting brand colors:', crawledData.brand_colors);
            // Ensure colors are in the correct format
            const formattedColors = crawledData.brand_colors.map((color: any) => ({
              color: color.hex || color.color,
              hex: color.hex || color.color
            }));
            setColors(formattedColors);
          }

          // Update company description if available
          if (crawledData.company_summary) {
            console.log('Recipe2_2 - Setting company summary:', crawledData.company_summary);
            setCompanyDescription(crawledData.company_summary);
          } else if (crawledData.about_text) {
            console.log('Recipe2_2 - Setting about text:', crawledData.about_text);
            setCompanyDescription(crawledData.about_text);
          }

          // Update tone of voice if available
          if (crawledData.tone_of_voice_example) {
            console.log('Recipe2_2 - Setting tone of voice:', crawledData.tone_of_voice_example);
            setToneOfVoice(crawledData.tone_of_voice_example);
          }
        } else {
          console.log('Recipe2_2 - No crawled data found');
        }
      } catch (error) {
        console.error('Error parsing demo data:', error);
      }
    } else {
      console.log('Recipe2_2 - No demo data found in localStorage');
    }
  }, []);


  // const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     setLogoFile(file);
  //   }
  // };

  // const handleContinue = () => {
  //   const recipeData = {
  //     logo: logoFile,
  //     colors,
  //     brandAssets,
  //     companyDescription,
  //     toneOfVoice,
  //     timestamp: Date.now()
  //   };

  //   console.log('Recipe 2.2 data:', recipeData);
  //   alert('Content generation completed! (This will be replaced with navigation)');
  // };

  const handleRestartDemo = () => {
    // Navigate back to DemoSetup page
    onNavigate?.('demo-setup');
  };

  const handleChatClick = (candidateInfo: any, currentRole?: string) => {
    // Parse first name from full name
    const fullName = candidateInfo?.name || 'Unknown';
    const firstName = fullName.split(' ')[0];

    // Get interests and job preferences from the stored email data (from Kong API) for the current role
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
      jobSpecifics: [], // Ideally empty initially
      company: 'Kong'
    }; // fallback

    try {
      const preGeneratedData = localStorage.getItem('preGeneratedEmailData');
      if (preGeneratedData) {
        const parsedData = JSON.parse(preGeneratedData);
        
        // Map role keys to user-friendly names for backward compatibility
        const roleName = currentRole === 'jacobWang' ? 'Jacob Wang' :
                        currentRole === 'kristinaWong' ? 'Kristina Wong' : currentRole;

        // Try to get data from role-specific data for the current role
        if (parsedData.roleEmails && currentRole && parsedData.roleEmails[currentRole]) {
          const roleData = parsedData.roleEmails[currentRole];

          // Parse interests
          if (roleData.interests) {
            const interestsText = roleData.interests;
            console.log(`Getting interests for role ${currentRole}:`, interestsText);

            // Parse the interests text (format: "• Interest 1\n• Interest 2\n...")
            const interestLines = interestsText.split('\n')
              .filter((line: string) => line.trim().startsWith('•'))
              .map((line: string) => line.replace('•', '').trim())
              .filter((line: string) => line.length > 0);

            if (interestLines.length > 0) {
              professionalInterests = interestLines;
              console.log(`Using API interests for ${roleName} in chat:`, professionalInterests);
            }
          }

          // Parse job preferences
          if (roleData.job_preferences) {
            const jobPrefText = roleData.job_preferences;
            console.log(`Getting job preferences for role ${currentRole}:`, jobPrefText);

            // Parse job preferences text (format: "Job Titles: X, Y\nLocation: Z\nSeniority: W")
            const lines = jobPrefText.split('\n');
            const parsedJobPrefs = { ...jobPreferences }; // start with fallback

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
            console.log(`Using API job preferences for ${roleName} in chat:`, jobPreferences);
          }
        }
        // Fallback to primary candidate data if no role-specific data
        else {
          if (parsedData.interests) {
            const interestsText = parsedData.interests;
            const interestLines = interestsText.split('\n')
              .filter((line: string) => line.trim().startsWith('•'))
              .map((line: string) => line.replace('•', '').trim())
              .filter((line: string) => line.length > 0);
            
            if (interestLines.length > 0) {
              professionalInterests = interestLines;
              console.log('Using fallback API interests for chat:', professionalInterests);
            }
          }

          if (parsedData.job_preferences) {
            const jobPrefText = parsedData.job_preferences;
            console.log('Getting fallback job preferences:', jobPrefText);
            
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
            console.log('Using fallback API job preferences for chat:', jobPreferences);
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

  return (
    <div className="recipe2">
      <div className="recipe2-container">
        {/* Header */}
        <div className="recipe2-header">
          <div className="title-with-logo">
            <img
              className="x-logo"
              src="/AI%20Loader.gif"
              alt="Logo"
            />
            <h1 className="recipe2-title">All set! Ready for me to take it from here and keep things moving?</h1>
          </div>
        </div>

        {/* Content */}
        <div className="recipe2-content">
          {/* Email Preview - Left Column */}
          <div className="recipe2-preview">
            <EmailPreview onChatClick={handleChatClick} />
          </div>

          {/* Interaction Contract - Right Column */}
          <InteractionContract />
        </div>
      </div>

      {/* Restart Demo Button */}
      <button
        className="restart-demo-button"
        onClick={handleRestartDemo}
        title="Restart Demo"
      >
        <span className="material-icons-round">refresh</span>
        <span className="restart-text">Restart</span>
      </button>
    </div>
  );
};

export default Recipe2_2;