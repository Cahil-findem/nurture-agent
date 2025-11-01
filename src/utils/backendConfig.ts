export interface CandidateInfo {
  id: string;
  name: string;
  role: string;
  fullProfile?: any; // For Natera backend, store full candidate JSON
}

export interface BrandingConfig {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  website: string;
  bannerPlaceholder?: string;
}

export interface BackendConfig {
  name: 'kong' | 'natera';
  apiUrl: string;
  candidates: CandidateInfo[];
  branding: BrandingConfig;
}

export const BACKENDS: Record<'kong' | 'natera', BackendConfig> = {
  kong: {
    name: 'kong',
    apiUrl: 'https://kong-email-creator.vercel.app/api/generate-email',
    candidates: [
      { id: 'pub_hola_5c7d24bb19976ca87e8f8bbb', name: 'Jacob Wang', role: 'Senior Software Engineer' },
      { id: 'pub_5d984bc378b4d04f623a7b2f', name: 'Kristina Wong', role: 'Senior Product Designer' },
      { id: 'pub_5c7baa020cadfda94cb36a7f', name: 'Colin Farnan', role: 'Account Executive' },
      { id: 'pub_5c7bbb110cadfda94c27eb89', name: 'Vijay Kethan', role: 'Senior Customer Success Manager' }
    ],
    branding: {
      logo: '/kong-logo.svg',
      primaryColor: '#0081FE',
      secondaryColor: '#003459',
      companyName: 'Kong',
      website: 'www.kong.com/blog'
    }
  },
  natera: {
    name: 'natera',
    apiUrl: 'https://natera-blog-crawler.vercel.app/api/generate-email',
    candidates: [
      {
        id: 'pub_5d984f6178b4d04f6244fa78',
        name: 'Ozgur Acar',
        role: 'Registered Nurse at Stanford Healthcare Hospital',
        fullProfile: {
          "ref": "pub_5d984f6178b4d04f6244fa78",
          "candidate": {
            "full_name": "Ozgur Acar",
            "title": "Registered Nurse at Stanford Healthcare Hospital - Palo Alto, CA",
            "company": "Stanford Healthcare Hospital",
            "location": "Palo Alto, CA",
            "is_active": true,
            "professional_summary": "Registered Nurse with 4 years of experience specializing in Cardio Thoracic Care and Progressive Care. Proven expertise in medication administration, EKG interpretation, patient care, and clinical documentation. Skilled in managing post-operative cardiac patients, including thoracotomy, LVAD, and heart transplant cases. Strong collaborator with multidisciplinary healthcare teams dedicated to delivering compassionate, evidence-based care.",
            "past_roles": [
              {
                "title": "Registered Nurse",
                "company": "Stanford Healthcare Hospital",
                "location": "Palo Alto, CA",
                "start_date": "2024-01-01",
                "end_date": null
              },
              {
                "title": "Registered Nurse",
                "company": "Kaiser Permanente",
                "location": "San Francisco, CA",
                "start_date": "2021-06-01",
                "end_date": "2023-12-31"
              }
            ],
            "education": [
              {
                "degree": "Bachelor of Science in Nursing (BSN)",
                "institution": "San Francisco State University",
                "graduation_year": 2021
              }
            ],
            "skills": [
              "Patient Care",
              "Medication Administration",
              "EKG Interpretation",
              "Clinical Documentation",
              "Post-Operative Care",
              "LVAD Management",
              "Heart Transplant Care",
              "Multidisciplinary Collaboration"
            ]
          }
        }
      },
      {
        id: 'pub_cs_677938b45911ed1d97316bc9',
        name: 'Carol-Anne Weeks',
        role: 'Healthcare Specialist at Amgen'
      },
      {
        id: 'pub_plab_608d43769eb26d0fa4062315',
        name: 'Breanna Achenbach',
        role: 'Phlebotomist at Quest Diagnostics'
      }
    ],
    branding: {
      logo: '/natera-logo.svg',
      primaryColor: '#00A9CE',
      secondaryColor: '#005F7F',
      companyName: 'Natera',
      website: 'www.natera.com/company/news',
      bannerPlaceholder: '#E0F7FA'
    }
  }
};

export function getBackendConfig(backend: 'kong' | 'natera'): BackendConfig {
  return BACKENDS[backend];
}

export function getCurrentBackend(): 'kong' | 'natera' {
  const demoData = localStorage.getItem('demoSetupData');
  console.log('getCurrentBackend - Raw localStorage data:', demoData);

  if (demoData) {
    try {
      const parsed = JSON.parse(demoData);
      console.log('getCurrentBackend - Parsed data:', parsed);
      console.log('getCurrentBackend - Backend field:', parsed.backend);
      const backend = parsed.backend || 'kong';
      console.log('getCurrentBackend - Returning backend:', backend);
      return backend;
    } catch (e) {
      console.error('getCurrentBackend - Error parsing demo data:', e);
      return 'kong';
    }
  }
  console.log('getCurrentBackend - No demoSetupData found, defaulting to kong');
  return 'kong';
}

export function setCurrentBackend(backend: 'kong' | 'natera'): void {
  const demoData = localStorage.getItem('demoSetupData');
  if (demoData) {
    try {
      const parsed = JSON.parse(demoData);
      parsed.backend = backend;
      localStorage.setItem('demoSetupData', JSON.stringify(parsed));
    } catch (e) {
      console.error('Error setting backend:', e);
    }
  }
}
