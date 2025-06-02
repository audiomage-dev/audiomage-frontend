import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, BookOpen, Wand2, Music, Mic, Headphones, Sparkles, Zap, Target, Crown, Rocket, Star, Settings, Plus, Play, Download, Copy, Edit, Trash2 } from 'lucide-react';

interface SpellbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'mixing' | 'mastering' | 'recording' | 'creative' | 'vocal' | 'custom';
  icon: React.ReactNode;
  steps: string[];
  isCustom?: boolean;
  tags: string[];
}

export function SpellbookModal({ isOpen, onClose }: SpellbookModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('mixing');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  const workflowTemplates: WorkflowTemplate[] = [
    // Mixing Templates
    {
      id: 'vocal-chain',
      name: 'Professional Vocal Chain',
      description: 'Complete vocal processing chain for studio-quality recordings',
      category: 'vocal',
      icon: <Mic className="w-4 h-4" />,
      steps: [
        'Apply high-pass filter at 80Hz',
        'Add gentle compression (3:1 ratio)',
        'Apply de-esser for sibilance control',
        'EQ for presence and clarity',
        'Add subtle reverb and delay',
        'Final limiting for consistency'
      ],
      tags: ['vocals', 'compression', 'eq', 'reverb']
    },
    {
      id: 'drum-mix',
      name: 'Punchy Drum Mix',
      description: 'Create powerful, punchy drums that cut through the mix',
      category: 'mixing',
      icon: <Target className="w-4 h-4" />,
      steps: [
        'Gate drums for tightness',
        'Compress kick and snare separately',
        'Apply parallel compression to drum bus',
        'EQ for punch and clarity',
        'Add subtle saturation for warmth',
        'Balance stereo image with panning'
      ],
      tags: ['drums', 'compression', 'gating', 'eq']
    },
    {
      id: 'mix-bus-master',
      name: 'Mix Bus Processing',
      description: 'Professional mix bus chain for cohesive sound',
      category: 'mastering',
      icon: <Crown className="w-4 h-4" />,
      steps: [
        'Apply gentle mix bus compression',
        'Add harmonic saturation',
        'EQ for final tonal balance',
        'Stereo imaging enhancement',
        'Final limiting for loudness',
        'Check mono compatibility'
      ],
      tags: ['mastering', 'bus', 'compression', 'limiting']
    },
    {
      id: 'creative-fx',
      name: 'Creative FX Chain',
      description: 'Experimental effects for unique textures and sounds',
      category: 'creative',
      icon: <Sparkles className="w-4 h-4" />,
      steps: [
        'Apply modulated delays',
        'Add pitch shifting effects',
        'Layer reverse reverbs',
        'Apply granular synthesis',
        'Add filter automation',
        'Blend with dry signal'
      ],
      tags: ['creative', 'effects', 'modulation', 'experimental']
    },
    {
      id: 'recording-setup',
      name: 'Recording Session Setup',
      description: 'Optimal setup for recording sessions with proper monitoring',
      category: 'recording',
      icon: <Headphones className="w-4 h-4" />,
      steps: [
        'Set up input monitoring',
        'Configure low-latency buffers',
        'Set recording levels (peak at -6dB)',
        'Enable click track and metronome',
        'Create cue mix for performers',
        'Arm tracks and check signal flow'
      ],
      tags: ['recording', 'monitoring', 'setup', 'session']
    },
    {
      id: 'mix-prep',
      name: 'Mix Preparation',
      description: 'Organize and prepare tracks for mixing workflow',
      category: 'mixing',
      icon: <Music className="w-4 h-4" />,
      steps: [
        'Organize tracks by instrument groups',
        'Color-code track categories',
        'Set up bus routing structure',
        'Create basic level balance',
        'Add track markers and regions',
        'Set up reference monitoring'
      ],
      tags: ['organization', 'preparation', 'workflow', 'mixing']
    }
  ];

  const categories = [
    { id: 'mixing', name: 'Mixing', icon: <Music className="w-4 h-4" /> },
    { id: 'mastering', name: 'Mastering', icon: <Crown className="w-4 h-4" /> },
    { id: 'recording', name: 'Recording', icon: <Mic className="w-4 h-4" /> },
    { id: 'vocal', name: 'Vocal', icon: <Headphones className="w-4 h-4" /> },
    { id: 'creative', name: 'Creative', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'custom', name: 'Custom', icon: <Settings className="w-4 h-4" /> }
  ];

  const filteredTemplates = workflowTemplates.filter(template => template.category === selectedCategory);

  const handleTemplateExecute = (template: WorkflowTemplate) => {
    console.log(`Executing workflow template: ${template.name}`);
    // Here you would implement the actual template execution
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg w-[90vw] max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Spellbook</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Audio workflow templates and recipes</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Categories */}
          <div className="w-64 border-r border-[var(--border)] bg-[var(--muted)]/20">
            <div className="p-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => {
                  const categoryCount = workflowTemplates.filter(t => t.category === category.id).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                          : 'hover:bg-[var(--accent)] text-[var(--foreground)]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {category.icon}
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        selectedCategory === category.id
                          ? 'bg-[var(--primary-foreground)]/20 text-[var(--primary-foreground)]'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                      }`}>
                        {categoryCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-t border-[var(--border)]">
              <Button
                onClick={() => setIsCreatingTemplate(true)}
                className="w-full justify-start"
                variant="ghost"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Template List */}
            <div className="w-80 border-r border-[var(--border)] overflow-y-auto">
              <div className="p-3">
                <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
                  {categories.find(c => c.id === selectedCategory)?.name} Templates
                </h3>
                <div className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--accent)]/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-[var(--primary)] mt-0.5">
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-[var(--foreground)] mb-1">
                            {template.name}
                          </h4>
                          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-1.5 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Details */}
            <div className="flex-1 overflow-y-auto">
              {selectedTemplate ? (
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-[var(--primary)]/10 rounded-lg">
                        <div className="text-[var(--primary)] w-6 h-6">
                          {selectedTemplate.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                          {selectedTemplate.name}
                        </h3>
                        <p className="text-[var(--muted-foreground)] mb-4">
                          {selectedTemplate.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {selectedTemplate.isCustom && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">Workflow Steps</h4>
                    <div className="space-y-3">
                      {selectedTemplate.steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-[var(--foreground)]">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleTemplateExecute(selectedTemplate)}
                      className="flex-1"
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Execute Template
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                      Select a Template
                    </h3>
                    <p className="text-[var(--muted-foreground)]">
                      Choose a workflow template to view details and execute
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}