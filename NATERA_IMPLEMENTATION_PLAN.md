# Natera Backend Integration Plan for Cleo

## Current Architecture Analysis

### Existing Setup (Kong)
- **Backend API**: `https://kong-email-creator.vercel.app/api/generate-email`
- **Hardcoded Candidates**: 4 Kong-specific candidates (Jacob Wang, Kristina Wong, Colin Farnan, Vijay Kethan)
- **API Call Location**: `RecipeLoader.tsx` lines 73-150+
- **Logo/Branding**: Kong-specific assets in `public/` folder
- **No backend selection**: Currently hardcoded to Kong

---

## Implementation Plan

### Phase 1: Backend Selection Architecture

#### 1.1 Update DemoSetup Screen
**File**: `src/pages/DemoSetup.tsx`

**Changes**:
- Add backend selection dropdown/toggle between "Kong" and "Natera"
- Store backend selection in localStorage alongside name/email
- Update interface:
```typescript
interface DemoSetupData {
  userName: string;
  userEmail: string;
  backend: 'kong' | 'natera';  // NEW
  timestamp: number;
}
```

**UI Design**:
```
┌─────────────────────────────────────┐
│  Setup Your Demo                    │
│                                     │
│  First Name: [_____________]        │
│  Email:      [_____________]        │
│                                     │
│  Backend:    ○ Kong  ○ Natera      │
│              (radio buttons)        │
│                                     │
│  [Launch Demo]                      │
└─────────────────────────────────────┘
```

---

### Phase 2: Backend Configuration

#### 2.1 Create Backend Config File
**New File**: `src/utils/backendConfig.ts`

```typescript
export interface BackendConfig {
  name: 'kong' | 'natera';
  apiUrl: string;
  candidates: CandidateInfo[];
  branding: BrandingConfig;
}

interface CandidateInfo {
  id: string;
  name: string;
  role: string;
}

interface BrandingConfig {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  website: string;
  bannerImage?: string;
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
    apiUrl: 'http://localhost:5002/api/generate-email',  // UPDATE FOR PRODUCTION
    candidates: [
      // TO BE PROVIDED BY CLIENT
      { id: 'TBD', name: 'TBD', role: 'TBD' },
      { id: 'TBD', name: 'TBD', role: 'TBD' },
      { id: 'TBD', name: 'TBD', role: 'TBD' },
      { id: 'TBD', name: 'TBD', role: 'TBD' }
    ],
    branding: {
      logo: '/natera-logo.svg',  // TO BE PROVIDED
      primaryColor: '#0066CC',  // TO BE CONFIRMED
      secondaryColor: '#003366',  // TO BE CONFIRMED
      companyName: 'Natera',
      website: 'www.natera.com/company/news',
      bannerImage: '/natera-banner.png'  // TO BE PROVIDED
    }
  }
};

export function getBackendConfig(backend: 'kong' | 'natera'): BackendConfig {
  return BACKENDS[backend];
}

export function getCurrentBackend(): 'kong' | 'natera' {
  const demoData = localStorage.getItem('demoSetupData');
  if (demoData) {
    const parsed = JSON.parse(demoData);
    return parsed.backend || 'kong';
  }
  return 'kong';
}
```

---

### Phase 3: Update RecipeLoader

#### 3.1 Make RecipeLoader Backend-Agnostic
**File**: `src/pages/RecipeLoader.tsx`

**Changes**:
1. Import backend config
2. Dynamically load API URL and candidates based on selected backend
3. Update loading card text dynamically

```typescript
// At top of file
import { getCurrentBackend, getBackendConfig } from '../utils/backendConfig';

// In component
const backend = getCurrentBackend();
const config = getBackendConfig(backend);

// Update cards dynamically
const [cards, setCards] = useState<LoadingCard[]>([
  {
    id: 1,
    icon: 'article',
    title: 'Gathering recent blog posts',
    text: config.branding.website,  // Dynamic!
    visible: false,
    isImageCard: true
  },
  // ... rest of cards
]);

// Update API call
const response = await fetch(config.apiUrl, {  // Dynamic!
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ candidate_id: candidateId })
});
```

---

### Phase 4: Email Template Differences

#### 4.1 Conditional Email Rendering
**File**: `src/components/EmailPreview.tsx` (likely)

**Natera-Specific Changes**:
- Different banner/header image
- Different logo in email
- Different footer
- Different CTA buttons/links
- Different color scheme

**Implementation**:
```typescript
const backend = getCurrentBackend();
const config = getBackendConfig(backend);

// In render
{backend === 'natera' ? (
  <div className="natera-email-header">
    <img src={config.branding.bannerImage} />
  </div>
) : (
  <div className="kong-email-header">
    {/* Kong header */}
  </div>
)}
```

---

### Phase 5: Branding Assets

#### 5.1 Assets Needed from Client

**For Natera**:
1. **Logo** (SVG preferred):
   - `public/natera-logo.svg`
   - Light/dark versions if needed

2. **Email Banner**:
   - `public/natera-banner.png`
   - Recommended: 600px wide

3. **Colors**:
   - Primary brand color (hex)
   - Secondary/accent color (hex)

4. **4 Candidate Profiles** with:
   - Candidate ID (from Natera database)
   - Full name
   - Job role/title

---

### Phase 6: Dynamic Styling

#### 6.1 CSS Variables
**File**: `src/index.css` or `src/App.css`

```css
:root {
  --primary-color: var(--backend-primary, #0081FE);
  --secondary-color: var(--backend-secondary, #003459);
}

/* Dynamically set via JS */
body.backend-kong {
  --backend-primary: #0081FE;
  --backend-secondary: #003459;
}

body.backend-natera {
  --backend-primary: #0066CC;
  --backend-secondary: #003366;
}
```

#### 6.2 Apply Backend Class
**File**: `src/App.tsx`

```typescript
useEffect(() => {
  const backend = getCurrentBackend();
  document.body.className = `backend-${backend}`;
}, []);
```

---

## API Compatibility Check

### Kong API Response Structure
```json
{
  "candidate": { "name": "...", "title": "..." },
  "professional_summary": "...",
  "job_preferences": "...",
  "interests": "...",
  "blog_matches": [...],
  "email": { "subject": "...", "body": "..." }
}
```

### Natera API Response Structure
```json
{
  "candidate": { "id": "...", "name": "...", "title": "..." },
  "professional_summary": "...",
  "job_preferences": "...",
  "interests": "...",
  "blog_matches": [...],  // or "news_matches"?
  "email": { "subject": "...", "body": "..." }
}
```

**ACTION**: Verify Natera API returns same structure OR add adapter layer

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Update `DemoSetup.tsx` with backend selector
- [ ] Add backend to localStorage data structure
- [ ] Test backend selection persistence

### Phase 2: Configuration
- [ ] Create `backendConfig.ts`
- [ ] Add Kong configuration
- [ ] Add Natera placeholder configuration
- [ ] **GET NATERA CANDIDATE IDs from client**
- [ ] **GET NATERA BRANDING ASSETS from client**

### Phase 3: Integration
- [ ] Update `RecipeLoader.tsx` to use dynamic config
- [ ] Update API calls to use selected backend
- [ ] Update loading cards with dynamic branding
- [ ] Test with both backends

### Phase 4: Email Templates
- [ ] Identify all email rendering components
- [ ] Add conditional rendering for Natera
- [ ] Update banner/header images
- [ ] Update footer content
- [ ] Test email previews for both backends

### Phase 5: Styling
- [ ] Add CSS variables for dynamic colors
- [ ] Apply backend class to body
- [ ] Test color theming for both backends

### Phase 6: Testing
- [ ] Test Kong backend (existing flow)
- [ ] Test Natera backend (new flow)
- [ ] Test switching between backends
- [ ] Test localStorage persistence
- [ ] Test all email previews

---

## Open Questions for Client

1. **Natera API**: Is the response structure identical to Kong's API?
2. **Candidate Profiles**: Please provide 4 candidate IDs for Natera demo
3. **Branding Assets**:
   - Natera logo (SVG)
   - Email banner image
   - Brand colors (primary/secondary hex codes)
4. **Deployment**: Will Natera backend be on Vercel or different host?
5. **Content Differences**: Are there specific content/copy changes needed for Natera emails?

---

## Estimated Implementation Time

- **Phase 1 (Backend Selection)**: 1-2 hours
- **Phase 2 (Configuration)**: 1 hour
- **Phase 3 (RecipeLoader Updates)**: 2-3 hours
- **Phase 4 (Email Templates)**: 3-4 hours
- **Phase 5 (Dynamic Styling)**: 1-2 hours
- **Phase 6 (Testing)**: 2-3 hours

**Total**: ~10-15 hours

---

## Next Steps

1. Review this plan with client
2. Gather required assets (candidates, logos, colors)
3. Confirm API compatibility
4. Begin implementation in phases
5. Test with real Natera data once crawler completes
