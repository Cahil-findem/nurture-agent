import { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages = [],
  onSendMessage,
  isLoading = false
}) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allSuggestions = [
    { text: 'Please summarise the job for me', icon: 'description' },
    { text: 'Tell me why I\'m a good fit', icon: 'thumb_up' },
    { text: 'Tell me why I\'m not a good fit', icon: 'thumb_down' },
    { text: 'What does this job pay?', icon: 'attach_money' },
    { text: 'Can you help me practice interviewing?', icon: 'psychology' }
  ];

  // Filter out used suggestions
  const availableSuggestions = allSuggestions.filter(
    (suggestion) => !usedSuggestions.includes(suggestion.text)
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Maintain focus on input when loading state changes
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isLoading]);

  const handleInputFocus = () => {
    // Show suggestions every time if there are available suggestions
    if (availableSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow click events on suggestions to fire
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionClick = (questionText: string) => {
    // Add to used suggestions
    setUsedSuggestions((prev) => [...prev, questionText]);
    setShowSuggestions(false);
    if (onSendMessage) {
      onSendMessage(questionText);
      setMessage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && onSendMessage) {
      onSendMessage(message.trim());
      setMessage('');
      setShowSuggestions(false);
      // Keep focus on input after sending message - use multiple methods for reliability
      inputRef.current?.focus();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      // Additional focus after key press
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="chat-section">
      {/* Chat Area */}
      <div className="chat-area" ref={chatAreaRef}>
        {messages.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#6b7280', 
            padding: '40px 20px',
            fontSize: '16px'
          }}>
            Start a conversation by typing a message below
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={msg.type === 'ai' ? 'ai-message' : 'user-message'}>
            {msg.type === 'ai' ? (
              <span dangerouslySetInnerHTML={{ __html: msg.content }}></span>
            ) : (
              <p>{msg.content}</p>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="ai-message loading">
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* AI Input Component */}
      <div className="input-area">
        {/* Suggestions Popover */}
        {showSuggestions && availableSuggestions.length > 0 && (
          <div className="suggestions-popover">
            <div className="suggestions-header">
              <span className="material-icons-round header-icon">auto_awesome</span>
              <span className="suggestions-title">Cleo Assistant</span>
            </div>
            <div className="suggestions-list">
              {availableSuggestions.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(question.text)}
                >
                  <span className="material-icons-round suggestion-icon">{question.icon}</span>
                  <span className="suggestion-text">{question.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="ai-input-card">
          <div className="ai-input-content">
            <div className="input-row">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Type your message here..."
                className="ai-input-field"
                disabled={isLoading}
              />
            </div>

            <div className="action-row">
              <div className="left-actions">
                <button type="button" className="icon-button" aria-label="Add">
                  <span className="material-icons">add</span>
                </button>
                <button type="button" className="icon-button" aria-label="Settings">
                  <span className="material-icons">tune</span>
                </button>
              </div>

              <div className="right-actions">
                <button type="button" className="icon-button" aria-label="Voice input">
                  <span className="material-icons">mic</span>
                </button>
                <button 
                  type="submit" 
                  className={`send-button ${message.trim() && !isLoading ? 'active' : 'inactive'}`}
                  disabled={!message.trim() || isLoading}
                  aria-label="Send message"
                >
                  <span className="material-icons">arrow_upward</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;