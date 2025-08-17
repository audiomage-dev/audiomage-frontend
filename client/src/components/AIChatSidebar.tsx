import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
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
  RefreshCw,
  Mic,
  MicOff,
  Sparkles,
  Lightbulb,
  Activity,
  TrendingUp,
  Zap,
  AlertCircle,
  CheckCircle2,
  Info,
  Volume2,
  Waveform,
  Music,
  Settings,
  History,
  BookOpen,
  Target,
  Brain,
  Eye,
  EyeOff,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  BarChart,
  GitBranch,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Repeat,
  Download,
  Upload,
  Share2,
  Play,
  Pause,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'analysis' | 'warning' | 'success';
  metadata?: {
    confidence?: number;
    category?: string;
    audioContext?: {
      trackName?: string;
      position?: string;
      parameter?: string;
    };
    suggestion?: {
      before?: any;
      after?: any;
      impact?: string;
    };
  };
  actions?: {
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'destructive';
  }[];
  feedback?: 'positive' | 'negative' | null;
}

interface AnalysisData {
  loudness: { current: number; target: number; lufs: number };
  frequency: { low: number; mid: number; high: number };
  dynamics: { range: number; peaks: number; rms: number };
  issues: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

interface ProductionContext {
  stage: 'composition' | 'recording' | 'editing' | 'mixing' | 'mastering';
  currentTrack?: string;
  playbackPosition?: string;
  recentActions?: string[];
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentSession?: string;
}

export function AIChatSidebar({
  isOpen,
  onToggle,
  currentSession,
}: AIChatSidebarProps) {
  // Store messages per session
  const [sessionMessages, setSessionMessages] = useState<
    Record<string, ChatMessage[]>
  >({});

  // Get messages for current session with enhanced initial message
  const messages = sessionMessages[currentSession || 'default'] || [
    {
      id: '1',
      role: 'assistant',
      type: 'text',
      content: `Hello! I'm your AI production co-pilot for ${currentSession || 'this session'}. I'm actively analyzing your project and can help with:
• Real-time mixing suggestions
• EQ and compression optimization
• Creative production ideas
• Workflow automation
• Technical problem-solving

I see you're currently in the editing stage. Would you like me to analyze your current mix?`,
      timestamp: new Date(),
      metadata: {
        confidence: 0.95,
        category: 'greeting',
      },
    },
  ];

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'chat' | 'analysis' | 'suggestions' | 'history'
  >('chat');
  const [isListening, setIsListening] = useState(false);
  const [productionContext, setProductionContext] = useState<ProductionContext>(
    {
      stage: 'editing',
      currentTrack: 'Master Bus',
      playbackPosition: '01:23',
      recentActions: ['Applied EQ', 'Adjusted compression', 'Added reverb'],
    }
  );
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    loudness: { current: -14, target: -16, lufs: -14.5 },
    frequency: { low: 65, mid: 75, high: 55 },
    dynamics: { range: 8, peaks: -3, rms: -18 },
    issues: [
      {
        type: 'Low-end buildup',
        severity: 'medium',
        description: 'Excessive energy around 100-200Hz',
      },
      {
        type: 'Phase issues',
        severity: 'low',
        description: 'Potential phase cancellation in stereo field',
      },
    ],
  });
  const [assistanceLevel, setAssistanceLevel] = useState<
    'beginner' | 'intermediate' | 'expert'
  >('intermediate');
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const determineResponseType = (input: string): ChatMessage['type'] => {
    if (
      input.toLowerCase().includes('analyze') ||
      input.toLowerCase().includes('check')
    ) {
      return 'analysis';
    }
    if (
      input.toLowerCase().includes('suggest') ||
      input.toLowerCase().includes('improve')
    ) {
      return 'suggestion';
    }
    if (
      input.toLowerCase().includes('warning') ||
      input.toLowerCase().includes('problem')
    ) {
      return 'warning';
    }
    return 'text';
  };

  const categorizeMessage = (input: string): string => {
    if (input.toLowerCase().includes('eq')) return 'EQ';
    if (input.toLowerCase().includes('compress')) return 'Compression';
    if (input.toLowerCase().includes('mix')) return 'Mixing';
    if (input.toLowerCase().includes('master')) return 'Mastering';
    if (
      input.toLowerCase().includes('reverb') ||
      input.toLowerCase().includes('delay')
    )
      return 'Effects';
    return 'General';
  };

  const generateContextualActions = (input: string): ChatMessage['actions'] => {
    if (input.toLowerCase().includes('analyze')) {
      return [
        {
          label: 'Run Full Analysis',
          action: () => console.log('Running analysis...'),
          variant: 'primary',
        },
        {
          label: 'View Details',
          action: () => setActiveTab('analysis'),
          variant: 'secondary',
        },
      ];
    }
    if (input.toLowerCase().includes('suggest')) {
      return [
        {
          label: 'Apply Suggestion',
          action: () => console.log('Applying...'),
          variant: 'primary',
        },
        {
          label: 'Preview',
          action: () => console.log('Previewing...'),
          variant: 'secondary',
        },
      ];
    }
    return undefined;
  };

  const generateEnhancedAIResponse = (
    input: string,
    session: string | undefined,
    context: ProductionContext
  ): string => {
    const contextInfo = `[Context: ${context.stage} stage, working on ${context.currentTrack} at ${context.playbackPosition}]
    
`;

    if (input.toLowerCase().includes('analyze')) {
      return (
        contextInfo +
        `I've analyzed your current mix. Here are my findings:

📊 **Frequency Balance**: Your low-end (65%) is well-balanced, but the high frequencies (55%) could use a slight boost around 8-12kHz for more air and presence.

🎚️ **Dynamics**: The dynamic range of 8dB is good for this genre. RMS at -18dB provides good headroom.

⚠️ **Issues Detected**:
• Slight low-end buildup around 100-200Hz - consider a gentle cut
• Minor phase issues in the stereo field - check your stereo widening plugins

Would you like me to suggest specific EQ settings to address these issues?`
      );
    }

    if (
      input.toLowerCase().includes('eq') ||
      input.toLowerCase().includes('frequency')
    ) {
      return (
        contextInfo +
        `Based on your track analysis, here are my EQ recommendations:

🎛️ **Suggested EQ Curve**:
• 80Hz: High-pass filter with 18dB/oct slope
• 150Hz: -2.5dB cut (Q: 0.7) to reduce muddiness
• 800Hz: +1.5dB boost (Q: 1.2) for more body
• 3.5kHz: +2dB boost (Q: 0.8) for presence
• 10kHz: +1.8dB shelf for air and brightness

These settings should help balance your frequency spectrum while maintaining the natural character of your mix.`
      );
    }

    return `I understand you're working on your ${session || 'audio project'}. ${contextInfo}Based on your recent actions (${context.recentActions?.join(', ')}), I can help optimize your workflow. What specific aspect would you like assistance with?`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Update messages for current session
    const sessionKey = currentSession || 'default';
    setSessionMessages((prev) => ({
      ...prev,
      [sessionKey]: [...(prev[sessionKey] || []), userMessage],
    }));
    setInputValue('');
    setIsTyping(true);

    // Enhanced AI response with context awareness
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: determineResponseType(inputValue),
        content: generateEnhancedAIResponse(
          inputValue,
          currentSession,
          productionContext
        ),
        timestamp: new Date(),
        metadata: {
          confidence: 0.85 + Math.random() * 0.15,
          category: categorizeMessage(inputValue),
          audioContext: {
            trackName: productionContext.currentTrack,
            position: productionContext.playbackPosition,
          },
        },
        actions: generateContextualActions(inputValue),
      };
      setSessionMessages((prev) => ({
        ...prev,
        [sessionKey]: [...(prev[sessionKey] || []), aiResponse],
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
    setSessionMessages((prev) => ({
      ...prev,
      [sessionKey]: [
        {
          id: '1',
          role: 'assistant',
          type: 'text',
          content: `Chat cleared for ${currentSession || 'this session'}. How can I assist you with your audio production today?`,
          timestamp: new Date(),
          metadata: {
            confidence: 0.95,
            category: 'system',
          },
        },
      ],
    }));
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // In production, this would integrate with Web Speech API
    if (!isListening) {
      console.log('Starting voice recognition...');
    } else {
      console.log('Stopping voice recognition...');
    }
  };

  const handleMessageFeedback = (
    messageId: string,
    feedback: 'positive' | 'negative'
  ) => {
    const sessionKey = currentSession || 'default';
    setSessionMessages((prev) => ({
      ...prev,
      [sessionKey]:
        prev[sessionKey]?.map((msg) =>
          msg.id === messageId ? { ...msg, feedback } : msg
        ) || [],
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

      {/* Enhanced Header with Context Display */}
      <div className="border-b border-[var(--border)] bg-[var(--muted)]">
        <div className="h-14 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[var(--primary)]" />
            <div>
              <h3 className="text-sm font-medium">AI Production Co-Pilot</h3>
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <Badge variant="secondary" className="h-4 text-[10px] px-1">
                  {productionContext.stage}
                </Badge>
                <span>{productionContext.currentTrack}</span>
                <Clock className="w-3 h-3" />
                <span>{productionContext.playbackPosition}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Select
              value={assistanceLevel}
              onValueChange={setAssistanceLevel as any}
            >
              <SelectTrigger className="h-7 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnalysisOverlay(!showAnalysisOverlay)}
              className={`h-7 w-7 p-0 hover:bg-[var(--accent)] ${showAnalysisOverlay ? 'bg-[var(--accent)]' : ''}`}
              title="Toggle Analysis Overlay"
            >
              {showAnalysisOverlay ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
            </Button>
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

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab as any}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 h-9 bg-transparent p-0">
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-[var(--background)] rounded-none text-xs"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="data-[state=active]:bg-[var(--background)] rounded-none text-xs"
            >
              <Activity className="w-3 h-3 mr-1" />
              Analysis
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="data-[state=active]:bg-[var(--background)] rounded-none text-xs"
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-[var(--background)] rounded-none text-xs"
            >
              <History className="w-3 h-3 mr-1" />
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div
                    className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}
                  >
                    {/* Message Type Indicator */}
                    {message.type &&
                      message.type !== 'text' &&
                      message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          {message.type === 'analysis' && (
                            <Activity className="w-3 h-3 text-blue-500" />
                          )}
                          {message.type === 'suggestion' && (
                            <Lightbulb className="w-3 h-3 text-yellow-500" />
                          )}
                          {message.type === 'warning' && (
                            <AlertCircle className="w-3 h-3 text-orange-500" />
                          )}
                          {message.type === 'success' && (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          )}
                          <span className="text-xs font-medium">
                            {message.type.charAt(0).toUpperCase() +
                              message.type.slice(1)}
                          </span>
                          {message.metadata?.confidence && (
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {Math.round(message.metadata.confidence * 100)}%
                              confidence
                            </span>
                          )}
                        </div>
                      )}

                    <div
                      className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] ml-auto'
                          : message.type === 'warning'
                            ? 'bg-orange-500/10 border border-orange-500/20'
                            : message.type === 'success'
                              ? 'bg-green-500/10 border border-green-500/20'
                              : message.type === 'analysis'
                                ? 'bg-blue-500/10 border border-blue-500/20'
                                : 'bg-[var(--muted)] text-[var(--foreground)]'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>

                      {/* Action Buttons */}
                      {message.actions && (
                        <div className="flex gap-2 mt-3">
                          {message.actions.map((action, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant={
                                action.variant === 'primary'
                                  ? 'default'
                                  : action.variant === 'destructive'
                                    ? 'destructive'
                                    : 'outline'
                              }
                              onClick={action.action}
                              className="h-7 text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      className={`flex items-center mt-1 gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.metadata?.category && (
                        <Badge variant="outline" className="h-4 text-[10px]">
                          {message.metadata.category}
                        </Badge>
                      )}
                      {message.role === 'assistant' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                            title="Copy message"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleMessageFeedback(message.id, 'positive')
                            }
                            className={`h-5 w-5 p-0 opacity-0 group-hover:opacity-100 ${message.feedback === 'positive' ? 'text-green-500' : ''}`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleMessageFeedback(message.id, 'negative')
                            }
                            className={`h-5 w-5 p-0 opacity-0 group-hover:opacity-100 ${message.feedback === 'negative' ? 'text-red-500' : ''}`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div
                    className={`flex-shrink-0 ${message.role === 'user' ? 'order-1 ml-2' : 'order-2 mr-2'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-[var(--secondary)]'
                          : 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : message.role === 'system' ? (
                        <Settings className="w-4 h-4" />
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
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-pulse delay-150"></div>
                        </div>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          AI is analyzing...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Audio Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Loudness Analysis */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Loudness (LUFS)</span>
                    <span>{analysisData.loudness.lufs} LUFS</span>
                  </div>
                  <Progress
                    value={
                      (analysisData.loudness.current /
                        analysisData.loudness.target) *
                      100
                    }
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs mt-1 text-[var(--muted-foreground)]">
                    <span>Current: {analysisData.loudness.current}</span>
                    <span>Target: {analysisData.loudness.target}</span>
                  </div>
                </div>

                {/* Frequency Balance */}
                <div>
                  <p className="text-xs font-medium mb-2">Frequency Balance</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-12">Low</span>
                      <Progress
                        value={analysisData.frequency.low}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs w-8">
                        {analysisData.frequency.low}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-12">Mid</span>
                      <Progress
                        value={analysisData.frequency.mid}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs w-8">
                        {analysisData.frequency.mid}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-12">High</span>
                      <Progress
                        value={analysisData.frequency.high}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs w-8">
                        {analysisData.frequency.high}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Issues Detected */}
                <div>
                  <p className="text-xs font-medium mb-2">Issues Detected</p>
                  <div className="space-y-2">
                    {analysisData.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-[var(--muted)] rounded"
                      >
                        {issue.severity === 'high' && (
                          <AlertCircle className="w-3 h-3 text-red-500 mt-0.5" />
                        )}
                        {issue.severity === 'medium' && (
                          <AlertCircle className="w-3 h-3 text-orange-500 mt-0.5" />
                        )}
                        {issue.severity === 'low' && (
                          <Info className="w-3 h-3 text-yellow-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-medium">{issue.type}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {issue.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Range Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart className="w-4 h-4" />
                  Dynamics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {analysisData.dynamics.range}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Dynamic Range (dB)
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {analysisData.dynamics.peaks}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Peak (dB)
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {analysisData.dynamics.rms}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      RMS (dB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="h-full overflow-y-auto p-4 space-y-3">
            {[
              {
                icon: Zap,
                title: 'Quick Fix: Low-end buildup',
                desc: 'Apply high-pass filter at 80Hz to clean up the mix',
                impact: 'high',
              },
              {
                icon: TrendingUp,
                title: 'Enhance presence',
                desc: 'Boost 3-5kHz range by 2dB for better clarity',
                impact: 'medium',
              },
              {
                icon: Sparkles,
                title: 'Add sparkle',
                desc: 'Gentle shelf boost at 10kHz for air and brightness',
                impact: 'low',
              },
              {
                icon: Target,
                title: 'Optimize dynamics',
                desc: 'Adjust compressor ratio to 3:1 for better punch',
                impact: 'high',
              },
            ].map((suggestion, idx) => (
              <Card
                key={idx}
                className="cursor-pointer hover:bg-[var(--accent)] transition-colors"
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        suggestion.impact === 'high'
                          ? 'bg-red-500/10'
                          : suggestion.impact === 'medium'
                            ? 'bg-yellow-500/10'
                            : 'bg-green-500/10'
                      }`}
                    >
                      <suggestion.icon
                        className={`w-4 h-4 ${
                          suggestion.impact === 'high'
                            ? 'text-red-500'
                            : suggestion.impact === 'medium'
                              ? 'text-yellow-500'
                              : 'text-green-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        {suggestion.desc}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            suggestion.impact === 'high'
                              ? 'destructive'
                              : suggestion.impact === 'medium'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="h-5 text-[10px]"
                        >
                          {suggestion.impact} impact
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 px-2 text-xs"
                        >
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 px-2 text-xs"
                        >
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="mb-3 flex items-center gap-2">
              <Input
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs"
              />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="EQ">EQ</SelectItem>
                  <SelectItem value="Compression">Compression</SelectItem>
                  <SelectItem value="Mixing">Mixing</SelectItem>
                  <SelectItem value="Effects">Effects</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              {messages
                .filter(
                  (msg) =>
                    (filterCategory === 'all' ||
                      msg.metadata?.category === filterCategory) &&
                    (!searchQuery ||
                      msg.content
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()))
                )
                .map((msg) => (
                  <div
                    key={msg.id}
                    className="p-2 border border-[var(--border)] rounded hover:bg-[var(--muted)] cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">
                        {msg.role === 'user' ? 'You' : 'AI'}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                      {msg.content}
                    </p>
                    {msg.metadata?.category && (
                      <Badge variant="outline" className="h-4 text-[10px] mt-1">
                        {msg.metadata.category}
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t border-[var(--border)] bg-[var(--muted)]">
        {/* Context-aware quick actions based on current stage */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--muted-foreground)]">
              Quick Actions
            </span>
            <Badge variant="outline" className="h-5 text-[10px]">
              {productionContext.stage} mode
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {productionContext.stage === 'editing' &&
              [
                { icon: Zap, label: 'Analyze current mix', action: 'analyze' },
                { icon: TrendingUp, label: 'Optimize EQ', action: 'eq' },
                { icon: Volume2, label: 'Check loudness', action: 'loudness' },
                {
                  icon: Sparkles,
                  label: 'Suggest improvements',
                  action: 'suggest',
                },
              ].map((quick) => (
                <Button
                  key={quick.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(quick.label)}
                  className="h-7 text-xs flex items-center gap-1"
                >
                  <quick.icon className="w-3 h-3" />
                  {quick.label}
                </Button>
              ))}
          </div>
        </div>

        {/* Main input area with voice support */}
        <div className="p-4 pt-2">
          <div className="flex gap-2">
            <Button
              variant={isListening ? 'destructive' : 'outline'}
              size="sm"
              onClick={toggleVoiceInput}
              className="h-11 w-11 p-0"
              title={isListening ? 'Stop recording' : 'Voice input'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isListening
                    ? 'Listening...'
                    : 'Ask anything or describe what you want to achieve...'
                }
                disabled={isListening}
                className="w-full p-3 pr-20 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg resize-none focus:outline-none focus:border-[var(--primary)] min-h-[44px] max-h-32 disabled:opacity-50"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '44px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height =
                    Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {inputValue.length > 0 && (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {inputValue.length}/500
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || isListening}
                  className="h-8 w-8 p-0 hover:bg-[var(--accent)]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* AI Status Indicator */}
          {showAnalysisOverlay && (
            <div className="mt-2 p-2 bg-[var(--accent)] rounded flex items-center gap-2">
              <Brain className="w-3 h-3 text-[var(--primary)] animate-pulse" />
              <span className="text-xs">
                AI is actively monitoring your project
              </span>
              <Badge variant="secondary" className="h-4 text-[10px] ml-auto">
                Real-time analysis ON
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
