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
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Header */}
      <div className="flex-none p-3 border-b border-[var(--border)] bg-gradient-to-r from-[var(--muted)] to-[var(--secondary)]">
        <div className="flex items-center space-x-2 mb-1">
          <div
            className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-[var(--yellow)] animate-pulse' : 'bg-[var(--green)]'}`}
          ></div>
          <span className="text-sm font-bold text-[var(--foreground)]">
            AI Assistant
          </span>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          Smart audio analysis
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin">
        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-gradient-to-r from-[var(--muted)] to-[var(--secondary)] p-3 rounded-lg border border-[var(--border)]">
            <div className="text-xs font-semibold text-[var(--primary)] mb-2">
              AI Suggestion:
            </div>
            <div className="text-xs text-[var(--foreground)] mb-3 leading-relaxed">
              "{suggestions[currentSuggestion]}"
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={applySuggestion}
                size="sm"
                className="flex-1 text-xs py-1 h-7 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
              >
                Apply
              </Button>
              <Button
                onClick={dismissSuggestion}
                size="sm"
                variant="outline"
                className="flex-1 text-xs py-1 h-7 border-[var(--border)] hover:bg-[var(--accent)]"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* AI Chat Interface */}
        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI about your audio..."
            className="min-h-[50px] text-xs bg-[var(--input)] border-[var(--border)] resize-none rounded-lg"
            rows={3}
          />
          <Button
            onClick={handleSendPrompt}
            disabled={!prompt.trim() || isProcessing}
            size="sm"
            className="w-full text-xs bg-[var(--primary)] text-white h-8 hover:bg-[var(--primary)]/90"
          >
            <i className="fas fa-paper-plane mr-1"></i>
            {isProcessing ? 'Processing...' : 'Send to AI'}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-10 flex flex-col items-center justify-center border-[var(--border)] hover:bg-[var(--accent)]"
          >
            <i className="fas fa-magic text-[var(--purple)] mb-1"></i>
            <span>Auto Mix</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-10 flex flex-col items-center justify-center border-[var(--border)] hover:bg-[var(--accent)]"
          >
            <i className="fas fa-microphone text-[var(--frost1)] mb-1"></i>
            <span>Enhance</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-10 flex flex-col items-center justify-center border-[var(--border)] hover:bg-[var(--accent)]"
          >
            <i className="fas fa-sliders-h text-[var(--frost2)] mb-1"></i>
            <span>EQ</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-10 flex flex-col items-center justify-center border-[var(--border)] hover:bg-[var(--accent)]"
          >
            <i className="fas fa-music text-[var(--green)] mb-1"></i>
            <span>Generate</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
