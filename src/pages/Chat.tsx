import { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import Header from '../components/Header';
import './Chat.css';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
}

interface CandidateData {
  name: string;
  firstName: string;
  jobPreferences: {
    titles: string[];
    locations: string[];
    levelSeniority: string;
    jobSpecifics: string[];
    company: string;
  };
  professionalInterests: string[];
  timestamp: number;
}

interface ChatProps {
  onNavigate?: (page: 'demo-setup' | 'onboarding' | 'recipe1' | 'recipe-loader' | 'recipe2' | 'outreach-contract' | 'chat') => void;
}

const Chat: React.FC<ChatProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [jobPosting, setJobPosting] = useState<any>(null);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [conversationStage, setConversationStage] = useState<'initial' | 'job_questions' | 'job_services' | 'job_complete' | 'job_verification' | 'job_details' | 'professional_interests' | 'professional_verification' | 'awaiting_preference_choice' | 'awaiting_professional_choice' | 'complete'>('initial');
  const [hasShownInitialLoader, setHasShownInitialLoader] = useState(false);

  // Load candidate data, job posting, and candidate profile from API data
  useEffect(() => {
    const loadAPIData = async () => {
      try {
        let jobData = null;
        let profileData = null;

        // Get data from the preGenerated API data
        const preGeneratedData = localStorage.getItem('preGeneratedEmailData');
        if (preGeneratedData) {
          const parsedData = JSON.parse(preGeneratedData);
          console.log('Loading data from API preGeneratedEmailData:', parsedData);

          // Determine current candidate role key from candidateData
          const loadedCandidateData = localStorage.getItem('candidateData');
          let currentCandidateRoleKey = 'jacobWang'; // default fallback
          
          if (loadedCandidateData) {
            try {
              const candidateInfo = JSON.parse(loadedCandidateData);
              // Map candidate names to role keys
              if (candidateInfo.name?.includes('Jacob Wang')) {
                currentCandidateRoleKey = 'jacobWang';
              } else if (candidateInfo.name?.includes('Kristina Wong')) {
                currentCandidateRoleKey = 'kristinaWong';
              } else if (candidateInfo.name?.includes('Colin Farnan')) {
                currentCandidateRoleKey = 'colinFarnan';
              }
              console.log('Determined current candidate role key:', currentCandidateRoleKey, 'for candidate:', candidateInfo.name);
            } catch (e) {
              console.error('Error parsing candidateData:', e);
            }
          }

          // Try to get job data from job_matches[0] for the current candidate ONLY
          if (parsedData.roleEmails?.[currentCandidateRoleKey]?.job_matches?.[0]) {
            jobData = parsedData.roleEmails[currentCandidateRoleKey].job_matches[0];
            console.log(`Using job data from API job_matches[0] for ${currentCandidateRoleKey}:`, jobData);
          } else {
            console.log(`No job matches found for candidate ${currentCandidateRoleKey}`);
            // Do NOT fallback to main emailData - each candidate should only get their own job matches
          }

          // Get candidate profile from API data - from candidate_profile field for the current candidate
          if (parsedData.roleEmails?.[currentCandidateRoleKey]?.candidate_profile) {
            try {
              const candidateProfileStr = parsedData.roleEmails[currentCandidateRoleKey].candidate_profile;
              profileData = typeof candidateProfileStr === 'string' ? JSON.parse(candidateProfileStr) : candidateProfileStr;
              console.log(`Using candidate profile from API candidate_profile field for ${currentCandidateRoleKey}:`, profileData);
            } catch (e) {
              console.error('Error parsing candidate_profile JSON:', e);
            }
          } else if (parsedData.emailData?.candidate_profile) {
            // Fallback to main emailData candidate_profile structure
            try {
              const candidateProfileStr = parsedData.emailData.candidate_profile;
              profileData = typeof candidateProfileStr === 'string' ? JSON.parse(candidateProfileStr) : candidateProfileStr;
              console.log('Using candidate profile from main emailData candidate_profile:', profileData);
            } catch (e) {
              console.error('Error parsing main candidate_profile JSON:', e);
            }
          } else if (parsedData.candidates?.[currentCandidateRoleKey]) {
            // Legacy fallback for specific candidate
            profileData = parsedData.candidates[currentCandidateRoleKey];
            console.log(`Using legacy candidate profile from API for ${currentCandidateRoleKey}:`, profileData);
          } else if (parsedData.candidate) {
            // Legacy fallback to main candidate structure
            profileData = parsedData.candidate;
            console.log('Using legacy candidate profile from main structure:', profileData);
          }
        } else {
          console.log('No preGeneratedEmailData found in localStorage');
        }

        // Set the data
        if (jobData) {
          setJobPosting(jobData);
        }
        if (profileData) {
          setCandidateProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading API data:', error);
      }
    };

    loadAPIData();
    
    const loadedCandidateData = localStorage.getItem('candidateData');
    if (loadedCandidateData) {
      try {
        const parsedCandidateData: CandidateData = JSON.parse(loadedCandidateData);
        setCandidateData(parsedCandidateData);
      } catch (error) {
        console.error('Error loading candidate data:', error);
      }
    }
  }, []);

  // Create initial messages after candidate data is loaded and API data is processed
  useEffect(() => {
    if (!hasShownInitialLoader && candidateData && (jobPosting || candidateProfile)) {
      // Show thinking loader for 2 seconds before displaying initial messages
      setTimeout(() => {
        // Create initial messages from Cleo
        const initialMessages: Message[] = [
          {
            id: '1',
            type: 'ai',
            content: `Hi ${candidateData.firstName}, my name is Cleo. You can think of me as your personal advocate on the inside here at ${candidateData.jobPreferences.company}. ${jobPosting ? `I see you were sent a note about the <strong>${jobPosting.position}</strong> role on our team.` : `My goal is to understand the types of opportunities you'd be interested in at ${candidateData.jobPreferences.company} as well as your professional interests.`}`,
            timestamp: Date.now()
          },
          {
            id: '2',
            type: 'ai',
            content: jobPosting ? `Do you have any questions about this job posting?` : createInitialSummary(candidateData),
            timestamp: Date.now() + 1
          }
        ];

        setMessages(initialMessages);
        setConversationStage(jobPosting ? 'job_questions' : 'job_verification');
        setIsLoading(false);
        setHasShownInitialLoader(true);
      }, 2000);
    } else if (!hasShownInitialLoader && candidateData) {
      // If we have candidate data but no job/profile data from API, start with general flow
      setTimeout(() => {
        setMessages([
          {
            id: '1',
            type: 'ai',
            content: `Hi ${candidateData.firstName}, my name is Cleo. You can think of me as your personal advocate on the inside here at ${candidateData.jobPreferences.company}. My goal is to understand the types of opportunities you'd be interested in at ${candidateData.jobPreferences.company} as well as your professional interests.`,
            timestamp: Date.now()
          },
          {
            id: '2',
            type: 'ai',
            content: createInitialSummary(candidateData),
            timestamp: Date.now() + 1
          }
        ]);
        setConversationStage('job_verification');
        setIsLoading(false);
        setHasShownInitialLoader(true);
      }, 2000);
    }
  }, [candidateData, jobPosting, candidateProfile, hasShownInitialLoader]);

  // Helper function to create initial summary
  const createInitialSummary = (candidate: CandidateData): string => {
    return createCurrentSummary(candidate) + "<br><br>Does this sound right, or is there anything you'd like me to update?";
  };

  // Helper function to convert markdown to HTML
  const markdownToHtml = (text: string): string => {
    return text
      // Convert **text** to <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert line breaks to <br> tags
      .replace(/\n/g, '<br>')
      // Convert bullet points (• or -) to proper format
      .replace(/^[•-]\s/gm, '• ')
      // Add some spacing after bullet points
      .replace(/• (.*?)(<br>|$)/g, '• $1<br>');
  };

  // Helper function to create current summary with proper formatting
  const createCurrentSummary = (candidate: CandidateData | null): string => {
    if (!candidate) return '';
    
    const jobBullets = [
      `Job Title(s): ${candidate.jobPreferences.titles.join(', ')}`,
      `Location(s): ${candidate.jobPreferences.locations.join(', ')}`,
      `Level/Seniority: ${candidate.jobPreferences.levelSeniority}`
    ];

    // Add job specifics if they exist
    if (candidate.jobPreferences.jobSpecifics.length > 0) {
      jobBullets.push(`Ideal job specifics: ${candidate.jobPreferences.jobSpecifics.join(', ')}`);
    }

    const professionalBullets = candidate.professionalInterests.map(interest => 
      interest.charAt(0).toUpperCase() + interest.slice(1)
    );

    const markdownText = `Let me confirm what I understand:

**Job Preferences:**
${jobBullets.map(bullet => `• ${bullet}`).join('\n')}

**Professional Interests:**
${professionalBullets.map(bullet => `• ${bullet}`).join('\n')}`;

    return markdownToHtml(markdownText);
  };

  // Function to call OpenAI API
  const callChatAPI = async (userMessage: string): Promise<string> => {
    try {
      const requestBody = {
        messages: [
          ...messages.map(msg => ({
            role: msg.type === 'ai' ? 'assistant' : 'user',
            content: msg.content
          })),
          {
            role: 'user',
            content: userMessage
          }
        ],
        candidateData,
        jobPosting,
        candidateProfile,
        conversationStage
      };

      console.log('=== FRONTEND API CALL ===');
      console.log('Request URL:', '/api/chat');
      console.log('User Message:', userMessage);
      console.log('Job Posting Available:', !!jobPosting);
      console.log('Job Posting Compensation:', jobPosting?.compensation);
      console.log('Request Body Keys:', Object.keys(requestBody));
      console.log('Full Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('========================');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('=== FRONTEND RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Failed to get response from chat API: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      console.log('========================');
      
      return data.message || 'Sorry, I couldn\'t generate a response.';
    } catch (error) {
      console.error('Error calling chat API:', error);
      return 'Sorry, I\'m having trouble connecting right now. Please try again.';
    }
  };

  // Function to extract profile updates from AI response
  const extractProfileUpdates = (aiResponse: string): Partial<CandidateData> | null => {
    // This is a simple parser - in a production app you might want more sophisticated parsing
    // or have the AI return structured data
    
    // Look for patterns that indicate profile updates
    const titleMatch = aiResponse.match(/Job Title\(s\):\s*([^•\n]+)/);
    const locationMatch = aiResponse.match(/Location\(s\):\s*([^•\n]+)/);
    const levelMatch = aiResponse.match(/Level\/Seniority:\s*([^•\n]+)/);
    const specificsMatch = aiResponse.match(/Ideal job specifics:\s*([^•\n]+)/);
    
    // Extract professional interests (look for bullet points after "Professional Interests:")
    const professionalSection = aiResponse.match(/Professional Interests:\*\*\s*((?:•[^\n]*\n?)*)/);
    
    let updates: Partial<CandidateData> = {};
    let hasUpdates = false;

    if (titleMatch) {
      const titles = titleMatch[1].trim().split(',').map(t => t.trim()).filter(t => t);
      if (titles.length > 0) {
        updates.jobPreferences = { ...candidateData?.jobPreferences, titles } as any;
        hasUpdates = true;
      }
    }

    if (locationMatch) {
      const locations = locationMatch[1].trim().split(',').map(l => l.trim()).filter(l => l);
      if (locations.length > 0) {
        updates.jobPreferences = { ...updates.jobPreferences, ...candidateData?.jobPreferences, locations } as any;
        hasUpdates = true;
      }
    }

    if (levelMatch) {
      const level = levelMatch[1].trim();
      if (level) {
        updates.jobPreferences = { ...updates.jobPreferences, ...candidateData?.jobPreferences, levelSeniority: level } as any;
        hasUpdates = true;
      }
    }

    if (specificsMatch) {
      const specifics = specificsMatch[1].trim().split(',').map(s => s.trim()).filter(s => s);
      updates.jobPreferences = { ...updates.jobPreferences, ...candidateData?.jobPreferences, jobSpecifics: specifics } as any;
      hasUpdates = true;
    }

    if (professionalSection) {
      const interests = professionalSection[1]
        .split('•')
        .map(interest => interest.trim())
        .filter(interest => interest && interest !== '')
        .map(interest => interest.replace(/^\s*/, '').replace(/\s*$/, ''));
      
      if (interests.length > 0) {
        updates.professionalInterests = interests;
        hasUpdates = true;
      }
    }

    return hasUpdates ? updates : null;
  };

  // Function to update conversation stage based on AI response
  const updateConversationStage = (aiResponse: string): string => {
    const lowerResponse = aiResponse.toLowerCase();
    
    // Job-specific flow transitions
    if (conversationStage === 'job_questions') {
      if (lowerResponse.includes('help you with') || lowerResponse.includes('can offer') || lowerResponse.includes('other services')) {
        return 'job_services';
      }
    } else if (conversationStage === 'job_services') {
      if (lowerResponse.includes('interested in other') || lowerResponse.includes('other opportunities')) {
        return 'job_complete';
      }
    } else if (conversationStage === 'job_complete') {
      return 'job_verification'; // Transition to general flow
    }
    
    // General flow transitions (original logic)
    if (lowerResponse.includes('professional interests') && lowerResponse.includes('what topics')) {
      return 'professional_interests';
    } else if (lowerResponse.includes('thanks for confirming') || lowerResponse.includes('have everything i need')) {
      return 'complete';
    } else if (lowerResponse.includes('does this look right') && lowerResponse.includes('professional interests')) {
      return 'professional_verification';
    } else if (lowerResponse.includes('does this') && (lowerResponse.includes('capture') || lowerResponse.includes('accurate'))) {
      return 'job_verification';
    }
    
    return conversationStage; // Keep current stage if no clear transition
  };

  const handleSendMessage = async (messageContent: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await callChatAPI(messageContent);
      
      // Check for profile updates in the response
      const profileUpdates = extractProfileUpdates(aiResponse);
      if (profileUpdates && candidateData) {
        const updatedCandidate = { 
          ...candidateData, 
          ...profileUpdates,
          timestamp: Date.now()
        };
        setCandidateData(updatedCandidate);
        
        // Save to localStorage
        try {
          localStorage.setItem('candidateData', JSON.stringify(updatedCandidate));
        } catch (error) {
          console.error('Error saving candidate data to localStorage:', error);
        }
      }
      
      // Update conversation stage
      const newStage = updateConversationStage(aiResponse);
      setConversationStage(newStage as any);
      
      // Add AI response with markdown conversion
      const cleoResponse: Message = {
        id: (Date.now() + Math.random()).toString(),
        type: 'ai',
        content: markdownToHtml(aiResponse),
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, cleoResponse]);
    } catch (error) {
      console.error('Error handling message:', error);
      // Add error message
      const errorResponse: Message = {
        id: (Date.now() + Math.random()).toString(),
        type: 'ai',
        content: 'Sorry, I\'m having trouble right now. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartDemo = () => {
    // Clear candidate data and navigate back to DemoSetup page
    localStorage.removeItem('candidateData');
    onNavigate?.('demo-setup');
  };

  const handleCloseClick = () => {
    onNavigate?.('outreach-contract');
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <Header
        title="Cleo Talent Agent"
        showCloseButton={true}
        onCloseClick={handleCloseClick}
        onRestart={handleRestartDemo}
        variant="chat"
      />

      {/* Chat Interface */}
      <div className="chat-content">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          hasJobPosting={!!jobPosting}
        />
      </div>
    </div>
  );
};

export default Chat;