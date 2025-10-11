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
  onNavigate?: (page: 'demo-setup' | 'onboarding' | 'recipe1' | 'recipe-loader' | 'recipe2' | 'recipe2_2' | 'chat') => void;
}

const Chat: React.FC<ChatProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [conversationStage, setConversationStage] = useState<'initial' | 'job_verification' | 'job_details' | 'professional_interests' | 'professional_verification' | 'awaiting_preference_choice' | 'awaiting_professional_choice' | 'complete'>('initial');

  // Load candidate data and initialize conversation
  useEffect(() => {
    const loadedCandidateData = localStorage.getItem('candidateData');
    if (loadedCandidateData) {
      try {
        const parsedCandidateData: CandidateData = JSON.parse(loadedCandidateData);
        setCandidateData(parsedCandidateData);
        
        // Create initial messages from Cleo
        const initialMessages: Message[] = [
          {
            id: '1',
            type: 'ai',
            content: `Hi ${parsedCandidateData.firstName}, my name is Cleo. You can think of me as your personal advocate on the inside here at ${parsedCandidateData.jobPreferences.company}. My goal is to understand the types of opportunities you'd be interested in at ${parsedCandidateData.jobPreferences.company} as well as your professional interests.`,
            timestamp: Date.now()
          },
          {
            id: '2',
            type: 'ai',
            content: createInitialSummary(parsedCandidateData),
            timestamp: Date.now() + 1
          }
        ];
        
        setMessages(initialMessages);
        setConversationStage('job_verification');
      } catch (error) {
        console.error('Error loading candidate data:', error);
        // Fallback message if no candidate data
        setMessages([
          {
            id: '1',
            type: 'ai',
            content: "Hi there! I'm Cleo, your personal advocate here at Kong. Let me know how I can help you explore opportunities with us.",
            timestamp: Date.now()
          }
        ]);
      }
    }
  }, []);

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
        conversationStage
      };

      console.log('=== FRONTEND API CALL ===');
      console.log('Request URL:', '/api/chat');
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
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