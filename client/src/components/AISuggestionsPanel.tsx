import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Square, CheckSquare, Zap, Lightbulb } from 'lucide-react';

interface Suggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  borderColor: string;
  accepted?: boolean;
  ignored?: boolean;
}

export function AISuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: '1',
      category: 'Mix Enhancement',
      title: 'High-shelf EQ on vocals',
      description: 'Consider adding high-shelf EQ to vocals around 8kHz for more presence',
      borderColor: 'border-l-[#5E81AC]'
    },
    {
      id: '2',
      category: 'Arrangement',
      title: 'Sidechain compression',
      description: 'Bass and kick drum could benefit from sidechain compression',
      borderColor: 'border-l-[#A3BE8C]'
    },
    {
      id: '3',
      category: 'Creative Idea',
      title: 'Tape saturation',
      description: 'Try a subtle tape saturation on the drum bus for vintage warmth',
      borderColor: 'border-l-[#EBCB8B]'
    },
    {
      id: '4',
      category: 'Mastering',
      title: 'LUFS optimization',
      description: 'Current LUFS: -14.2. Target: -14.0 for streaming platforms',
      borderColor: 'border-l-[#B48EAD]'
    }
  ]);

  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());

  const toggleSelection = (suggestionId: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId);
    } else {
      newSelected.add(suggestionId);
    }
    setSelectedSuggestions(newSelected);
  };

  const acceptSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, accepted: true, ignored: false } : s
    ));
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });
  };

  const ignoreSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, ignored: true, accepted: false } : s
    ));
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });
  };

  const acceptSelected = () => {
    setSuggestions(prev => prev.map(s => 
      selectedSuggestions.has(s.id) ? { ...s, accepted: true, ignored: false } : s
    ));
    setSelectedSuggestions(new Set());
  };

  const ignoreSelected = () => {
    setSuggestions(prev => prev.map(s => 
      selectedSuggestions.has(s.id) ? { ...s, ignored: true, accepted: false } : s
    ));
    setSelectedSuggestions(new Set());
  };

  const selectAll = () => {
    const activeSuggestions = suggestions.filter(s => !s.accepted && !s.ignored);
    setSelectedSuggestions(new Set(activeSuggestions.map(s => s.id)));
  };

  const clearSelection = () => {
    setSelectedSuggestions(new Set());
  };

  const activeSuggestions = suggestions.filter(s => !s.accepted && !s.ignored);
  const acceptedCount = suggestions.filter(s => s.accepted).length;
  const ignoredCount = suggestions.filter(s => s.ignored).length;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--foreground)]">AI Suggestions</h3>
        <div className="text-xs text-[var(--muted-foreground)]">
          {activeSuggestions.length} active • {acceptedCount} accepted • {ignoredCount} ignored
        </div>
      </div>

      {/* Multi-select controls */}
      {activeSuggestions.length > 0 && (
        <div className="mb-3 p-2 bg-[var(--secondary)] rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={selectAll}
                className="h-6 px-2 text-xs"
              >
                Select All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                className="h-6 px-2 text-xs"
                disabled={selectedSuggestions.size === 0}
              >
                Clear
              </Button>
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">
              {selectedSuggestions.size} selected
            </span>
          </div>
          
          {selectedSuggestions.size > 0 && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={acceptSelected}
                className="h-6 px-2 text-xs bg-[var(--green)] hover:bg-[var(--green)]/80"
              >
                <Check className="w-3 h-3 mr-1" />
                Accept ({selectedSuggestions.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={ignoreSelected}
                className="h-6 px-2 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Ignore ({selectedSuggestions.size})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Suggestions list */}
      <div className="space-y-3">
        {activeSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`bg-[var(--muted)] rounded-md p-3 border-l-2 ${suggestion.borderColor} ${
              selectedSuggestions.has(suggestion.id) ? 'ring-1 ring-[var(--primary)]' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleSelection(suggestion.id)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {selectedSuggestions.has(suggestion.id) ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
                <div className="text-xs font-medium text-[var(--foreground)]">
                  {suggestion.category}
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  onClick={() => acceptSuggestion(suggestion.id)}
                  className="h-5 w-5 p-0 bg-[var(--green)] hover:bg-[var(--green)]/80"
                  title="Accept"
                >
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => ignoreSuggestion(suggestion.id)}
                  className="h-5 w-5 p-0"
                  title="Ignore"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-[var(--muted-foreground)] ml-6">
              {suggestion.description}
            </div>
          </div>
        ))}

        {activeSuggestions.length === 0 && (
          <div className="text-center py-8 text-[var(--muted-foreground)]">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active suggestions</p>
            <p className="text-xs mt-1">All suggestions have been processed</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border)]">
        <Button size="sm" variant="outline" className="w-full text-xs">
          <Zap className="w-3 h-3 mr-2" />
          Generate New Suggestions
        </Button>
      </div>
    </div>
  );
}