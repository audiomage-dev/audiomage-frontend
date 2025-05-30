import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Send, 
  X, 
  ChevronLeft,
  Bot,
  User,
  Trash2,
  MoreVertical,
  Copy,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentSession?: string;
}

export function AIChatSidebar({ isOpen, onToggle, currentSession }: AIChatSidebarProps) {
  // Store messages per session
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>({});
  
  // Get messages for current session
  const messages = sessionMessages[currentSession || 'default'] || [
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI audio production assistant for ${currentSession || 'this session'}. I can help with mixing techniques, creative suggestions, technical questions, and workflow optimization. What would you like to work on today?`,
      timestamp: new Date()
    }
  ];
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle horizontal resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      // Constrain width between 300px and 800px
      const constrainedWidth = Math.max(300, Math.min(800, newWidth));
      setSidebarWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    // Update messages for current session
    const sessionKey = currentSession || 'default';
    setSessionMessages(prev => ({
      ...prev,
      [sessionKey]: [...(prev[sessionKey] || []), userMessage]
    }));
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (in real implementation, this would call the API)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're working on your ${currentSession || 'audio project'}. While I don't have access to external AI services right now, I can still provide guidance based on audio production best practices. What specific aspect would you like help with?`,
        timestamp: new Date()
      };
      setSessionMessages(prev => ({
        ...prev,
        [sessionKey]: [...(prev[sessionKey] || []), aiResponse]
      }));
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const sessionKey = currentSession || 'default';
    setSessionMessages(prev => ({
      ...prev,
      [sessionKey]: [{
        id: '1',
        role: 'assistant',
        content: `Chat cleared for ${currentSession || 'this session'}. How can I assist you with your audio production today?`,
        timestamp: new Date()
      }]
    }));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="fixed right-0 top-14 h-[calc(100vh-56px)] z-20">
        <div className="h-full flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-12 w-8 p-0 rounded-l-lg rounded-r-none bg-[var(--muted)] border border-r-0 border-[var(--border)] hover:bg-[var(--accent)] transition-all duration-200"
            title="Open AI Chat"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={sidebarRef}
      className="fixed right-0 top-14 h-[calc(100vh-80px)] bg-[var(--background)] border-l border-[var(--border)] flex flex-col z-20 shadow-lg"
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-[var(--primary)] transition-colors group"
        onMouseDown={handleMouseDown}
        style={{ background: isResizing ? 'var(--primary)' : 'transparent' }}
      >
        <div className="absolute left-[-2px] top-0 w-1 h-full group-hover:bg-[var(--primary)] transition-colors" />
      </div>
      {/* Header */}
      <div className="h-14 px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <h3 className="text-sm font-medium">AI Assistant</h3>
            <p className="text-xs text-[var(--muted-foreground)]">{currentSession || 'Current Session'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="h-7 w-7 p-0 hover:bg-[var(--accent)]"
            title="Clear Chat"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-7 w-7 p-0 hover:bg-[var(--accent)]"
            title="Close Chat"
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] ml-auto'
                    : 'bg-[var(--muted)] text-[var(--foreground)]'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              <div className={`flex items-center mt-1 space-x-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {formatTime(message.timestamp)}
                </span>
                {message.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                    title="Copy message"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className={`flex-shrink-0 ${message.role === 'user' ? 'order-1 ml-2' : 'order-2 mr-2'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-[var(--secondary)]' 
                  : 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="bg-[var(--muted)] p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--border)] p-4 bg-[var(--muted)]">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about mixing, effects, creative ideas..."
              className="w-full p-3 pr-12 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg resize-none focus:outline-none focus:border-[var(--primary)] min-h-[44px] max-h-32"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '44px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-[var(--accent)]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1 mt-2">
          {[
            'Mixing tips',
            'EQ suggestions',
            'Creative ideas',
            'Workflow help'
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => setInputValue(suggestion)}
              className="h-6 px-2 text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}