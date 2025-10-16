import { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
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
  const [isLoading, setIsLoading] = useState(false);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [jobPosting, setJobPosting] = useState<any>(null);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [conversationStage, setConversationStage] = useState<'initial' | 'job_questions' | 'job_services' | 'job_complete' | 'job_verification' | 'job_details' | 'professional_interests' | 'professional_verification' | 'awaiting_preference_choice' | 'awaiting_professional_choice' | 'complete'>('initial');

  // Load candidate data, job posting, and candidate profile files
  useEffect(() => {
    // Load job posting and candidate profile from example files
    const loadExampleData = async () => {
      try {
        // Load job posting
        const jobResponse = await fetch('/jobPosting.json');
        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          setJobPosting(jobData);
          console.log('Loaded job posting:', jobData);
        }

        // Load candidate profile
        const candidateResponse = await fetch('/candidateProfile.json');
        if (candidateResponse.ok) {
          const profileData = await candidateResponse.json();
          setCandidateProfile(profileData);
          console.log('Loaded candidate profile:', profileData);
        }
      } catch (error) {
        console.error('Error loading example data files:', error);
      }
    };

    loadExampleData();
    
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

  // Create initial messages after both candidate data and job posting are loaded
  useEffect(() => {
    if (candidateData && (jobPosting !== null || candidateProfile !== null)) {
      // Create initial messages from Cleo
      const initialMessages: Message[] = [
        {
          id: '1',
          type: 'ai',
          content: `Hi ${candidateData.firstName}, my name is Cleo. You can think of me as your personal advocate on the inside here at ${candidateData.jobPreferences.company}. ${jobPosting ? `I have a specific job opening I'd love to discuss with you - the ${jobPosting.position} role on our ${jobPosting.employment?.department} team.` : `My goal is to understand the types of opportunities you'd be interested in at ${candidateData.jobPreferences.company} as well as your professional interests.`}`,
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
    } else if (candidateData && jobPosting === null && candidateProfile === null) {
      // Fallback if data fails to load but we have candidate data
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
    }
  }, [candidateData, jobPosting, candidateProfile]);

  // Helper function to create initial summary
  const createInitialSummary = (candidate: CandidateData): string => {
    return createCurrentSummary(candidate) + "<br><br>Does this sound right, or is there anything you'd like me to update?";
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

    return `Let me confirm what I understand:<br>
<br>
<strong>Job Preferences:</strong><br>
${jobBullets.map(bullet => `• ${bullet}`).join('<br>')}<br>
<br>
<strong>Professional Interests:</strong><br>
${professionalBullets.map(bullet => `• ${bullet}`).join('<br>')}`;
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
      
      // Add AI response
      const cleoResponse: Message = {
        id: (Date.now() + Math.random()).toString(),
        type: 'ai',
        content: aiResponse,
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

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <h1 className="chat-title">
          {candidateData ? `Chat with ${candidateData.firstName}` : 'Kong Talent Chat'}
        </h1>
        <p className="chat-subtitle">
          {candidateData 
            ? `Cleo is helping ${candidateData.firstName} explore opportunities at ${candidateData.jobPreferences.company}`
            : 'Connect with candidates about their career interests'
          }
        </p>
      </div>

      {/* Chat Interface */}
      <div className="chat-content">
        <ChatInterface 
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
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

export default Chat;