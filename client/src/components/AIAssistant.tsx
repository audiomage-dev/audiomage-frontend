import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AIAssistantProps {
  suggestions: string[];
  isProcessing: boolean;
}

export function AIAssistant({ suggestions, isProcessing }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [currentSuggestion, setCurrentSuggestion] = useState(0);

  const handleSendPrompt = () => {
    if (prompt.trim()) {
      // Handle AI prompt submission
      console.log('AI Prompt:', prompt);
      setPrompt('');
    }
  };

  const applySuggestion = () => {
    // Handle applying AI suggestion
    console.log('Applying suggestion:', suggestions[currentSuggestion]);
    // Cycle to next suggestion
    setCurrentSuggestion((prev) => (prev + 1) % suggestions.length);
  };

  const dismissSuggestion = () => {
    // Cycle to next suggestion
    setCurrentSuggestion((prev) => (prev + 1) % suggestions.length);
  };

  return (
    <div className="p-3 border-b border-[hsl(var(--nord-2))]">
      <div className="flex items-center space-x-2 mb-2">
        <i className="fas fa-robot text-[hsl(var(--frost-1))]"></i>
        <span className="text-sm font-semibold">AI Assistant</span>
        <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-[hsl(var(--aurora-yellow))] animate-pulse' : 'bg-[hsl(var(--aurora-green))]'}`}></div>
      </div>
      
      {suggestions.length > 0 && (
        <div className="ai-glow bg-[hsl(var(--nord-2))] p-2 rounded text-xs mb-2">
          <div className="text-[hsl(var(--frost-1))] mb-1">💡 AI Suggestion:</div>
          <div className="text-[hsl(var(--nord-4))]">"{suggestions[currentSuggestion]}"</div>
          <div className="flex space-x-1 mt-2">
            <Button
              onClick={applySuggestion}
              size="sm"
              className="px-2 py-1 bg-[hsl(var(--frost-4))] text-white rounded text-xs h-auto"
            >
              Apply
            </Button>
            <Button
              onClick={dismissSuggestion}
              variant="ghost"
              size="sm"
              className="px-2 py-1 bg-[hsl(var(--nord-2))] hover:bg-[hsl(var(--nord-3))] rounded text-xs h-auto"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
      
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full bg-[hsl(var(--nord-2))] border border-[hsl(var(--nord-3))] rounded p-2 text-xs resize-none"
        rows={3}
        placeholder="Ask AI: 'Mix vocals louder', 'Add reverb to piano', 'Master for streaming'..."
      />
      
      <Button
        onClick={handleSendPrompt}
        className="w-full mt-2 bg-[hsl(var(--frost-3))] hover:bg-[hsl(var(--frost-4))] text-white py-1 rounded text-xs"
        disabled={!prompt.trim()}
      >
        <i className="fas fa-paper-plane mr-1"></i>
        Send to AI
      </Button>
    </div>
  );
}
