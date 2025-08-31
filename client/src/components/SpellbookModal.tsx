import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  X,
  BookOpen,
  Wand2,
  Music,
  Mic,
  Headphones,
  Sparkles,
  Zap,
  Target,
  Crown,
  Rocket,
  Star,
  Settings,
  Plus,
  Play,
  Download,
  Copy,
  Edit,
  Trash2,
  ArrowLeft,
  Check,
  AlertCircle,
} from 'lucide-react';

interface SpellbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | 'mixing'
    | 'mastering'
    | 'recording'
    | 'creative'
    | 'vocal'
    | 'custom';
  icon: React.ReactNode;
  steps: string[];
  isCustom?: boolean;
  tags: string[];
}

export function SpellbookModal({ isOpen, onClose }: SpellbookModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('mixing');
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'custom' as const,
    trigger: '',
    conditions: [] as string[],
    steps: [] as string[],
    tags: [] as string[],
  });

  const workflowTemplates: WorkflowTemplate[] = [
    // Mixing Templates
    {
      id: 'vocal-chain',
      name: 'Professional Vocal Chain',
      description:
        'Complete vocal processing chain for studio-quality recordings',
      category: 'vocal',
      icon: <Mic className="w-4 h-4" />,
      steps: [
        'Apply high-pass filter at 80Hz',
        'Add gentle compression (3:1 ratio)',
        'Apply de-esser for sibilance control',
        'EQ for presence and clarity',
        'Add subtle reverb and delay',
        'Final limiting for consistency',
      ],
      tags: ['vocals', 'compression', 'eq', 'reverb'],
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
        'Balance stereo image with panning',
      ],
      tags: ['drums', 'compression', 'gating', 'eq'],
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
        'Check mono compatibility',
      ],
      tags: ['mastering', 'bus', 'compression', 'limiting'],
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
        'Blend with dry signal',
      ],
      tags: ['creative', 'effects', 'modulation', 'experimental'],
    },
    {
      id: 'recording-setup',
      name: 'Recording Session Setup',
      description:
        'Optimal setup for recording sessions with proper monitoring',
      category: 'recording',
      icon: <Headphones className="w-4 h-4" />,
      steps: [
        'Set up input monitoring',
        'Configure low-latency buffers',
        'Set recording levels (peak at -6dB)',
        'Enable click track and metronome',
        'Create cue mix for performers',
        'Arm tracks and check signal flow',
      ],
      tags: ['recording', 'monitoring', 'setup', 'session'],
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
        'Set up reference monitoring',
      ],
      tags: ['organization', 'preparation', 'workflow', 'mixing'],
    },
  ];

  const categories = [
    { id: 'mixing', name: 'Mixing', icon: <Music className="w-4 h-4" /> },
    { id: 'mastering', name: 'Mastering', icon: <Crown className="w-4 h-4" /> },
    { id: 'recording', name: 'Recording', icon: <Mic className="w-4 h-4" /> },
    { id: 'vocal', name: 'Vocal', icon: <Headphones className="w-4 h-4" /> },
    {
      id: 'creative',
      name: 'Creative',
      icon: <Sparkles className="w-4 h-4" />,
    },
    { id: 'custom', name: 'Custom', icon: <Settings className="w-4 h-4" /> },
  ];

  const filteredTemplates = workflowTemplates.filter(
    (template) => template.category === selectedCategory
  );

  const handleTemplateExecute = (template: WorkflowTemplate) => {
    console.log(`Executing workflow template: ${template.name}`);
    // Here you would implement the actual template execution
  };

  const handleCreateTemplate = () => {
    setIsCreatingTemplate(true);
    setCreateStep(1);
    setNewTemplate({
      name: '',
      description: '',
      category: 'custom',
      trigger: '',
      conditions: [],
      steps: [],
      tags: [],
    });
  };

  const handleBackToList = () => {
    setIsCreatingTemplate(false);
    setCreateStep(1);
  };

  const addCondition = () => {
    setNewTemplate((prev) => ({
      ...prev,
      conditions: [...prev.conditions, ''],
    }));
  };

  const updateCondition = (index: number, value: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      conditions: prev.conditions.map((cond, i) =>
        i === index ? value : cond
      ),
    }));
  };

  const removeCondition = (index: number) => {
    setNewTemplate((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const addStep = () => {
    setNewTemplate((prev) => ({
      ...prev,
      steps: [...prev.steps, ''],
    }));
  };

  const updateStep = (index: number, value: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? value : step)),
    }));
  };

  const removeStep = (index: number) => {
    setNewTemplate((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const renderCreateTemplateView = () => {
    return (
      <div className="flex flex-1 overflow-hidden">
        {/* Progress Sidebar */}
        <div className="w-64 border-r border-[var(--border)] bg-[var(--muted)]/20">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">Create Template</span>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4">
              {[
                { step: 1, title: 'Basic Info', desc: 'Name and description' },
                { step: 2, title: 'Trigger', desc: 'When to execute' },
                { step: 3, title: 'Conditions', desc: 'Requirements to run' },
                { step: 4, title: 'Actions', desc: 'Workflow steps' },
                { step: 5, title: 'Review', desc: 'Finalize template' },
              ].map((item) => (
                <div key={item.step} className="flex items-start space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      createStep === item.step
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : createStep > item.step
                          ? 'bg-[var(--green)] text-white'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    {createStep > item.step ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      item.step
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${
                        createStep >= item.step
                          ? 'text-[var(--foreground)]'
                          : 'text-[var(--muted-foreground)]'
                      }`}
                    >
                      {item.title}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Create Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {createStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    Basic Information
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">
                    Set up the basic details for your workflow template.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      placeholder="Enter template name..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">
                      Description
                    </label>
                    <textarea
                      value={newTemplate.description}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] h-24 resize-none"
                      placeholder="Describe what this template does..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">
                      Category
                    </label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          category: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option value="mixing">Mixing</option>
                      <option value="mastering">Mastering</option>
                      <option value="recording">Recording</option>
                      <option value="vocal">Vocal</option>
                      <option value="creative">Creative</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {createStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    Trigger Event
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">
                    Choose when this template should be executed.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'track-added',
                      label: 'When: Track is added',
                      desc: 'Template runs when a new track is added to the project',
                    },
                    {
                      id: 'recording-started',
                      label: 'When: Recording started',
                      desc: 'Template runs when recording begins',
                    },
                    {
                      id: 'mixing-phase',
                      label: 'When: Mixing phase begins',
                      desc: 'Template runs when switching to mixing mode',
                    },
                    {
                      id: 'manual',
                      label: 'When: Manually triggered',
                      desc: 'Template runs only when explicitly executed',
                    },
                    {
                      id: 'audio-imported',
                      label: 'When: Audio file imported',
                      desc: 'Template runs when importing audio files',
                    },
                  ].map((trigger) => (
                    <div
                      key={trigger.id}
                      onClick={() =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          trigger: trigger.id,
                        }))
                      }
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        newTemplate.trigger === trigger.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 ${
                            newTemplate.trigger === trigger.id
                              ? 'border-[var(--primary)] bg-[var(--primary)]'
                              : 'border-[var(--border)]'
                          }`}
                        >
                          {newTemplate.trigger === trigger.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--foreground)]">
                            {trigger.label}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)] mt-1">
                            {trigger.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {createStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    Conditions
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">
                    Set conditions that must be met for the template to execute.
                  </p>
                </div>

                <div className="space-y-4">
                  {newTemplate.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]">
                        <option>Track count is greater than</option>
                        <option>Audio format is</option>
                        <option>Sample rate is</option>
                        <option>Project duration is less than</option>
                      </select>
                      <input
                        type="text"
                        value={condition}
                        onChange={(e) => updateCondition(index, e.target.value)}
                        className="w-32 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                        placeholder="Value"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(index)}
                        className="h-8 w-8 p-0 text-[var(--red)]"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addCondition}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
              </div>
            )}

            {createStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    Workflow Steps
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">
                    Define the sequence of actions to perform.
                  </p>
                </div>

                <div className="space-y-4">
                  {newTemplate.steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex items-center justify-center text-xs font-medium mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1 flex items-start space-x-2">
                        <textarea
                          value={step}
                          onChange={(e) => updateStep(index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] h-20 resize-none"
                          placeholder="Describe this step..."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(index)}
                          className="h-8 w-8 p-0 text-[var(--red)] mt-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addStep}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </div>
            )}

            {createStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    Review Template
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-6">
                    Review your template configuration before saving.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-[var(--muted)]/20 rounded-lg">
                    <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">
                      Basic Information
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div>
                        <strong>Name:</strong>{' '}
                        {newTemplate.name || 'Untitled Template'}
                      </div>
                      <div>
                        <strong>Description:</strong>{' '}
                        {newTemplate.description || 'No description'}
                      </div>
                      <div>
                        <strong>Category:</strong> {newTemplate.category}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--muted)]/20 rounded-lg">
                    <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">
                      Trigger
                    </h4>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {newTemplate.trigger || 'No trigger selected'}
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--muted)]/20 rounded-lg">
                    <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">
                      Conditions ({newTemplate.conditions.length})
                    </h4>
                    {newTemplate.conditions.length === 0 ? (
                      <div className="text-xs text-[var(--muted-foreground)]">
                        No conditions set
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {newTemplate.conditions.map((condition, index) => (
                          <div
                            key={index}
                            className="text-xs text-[var(--foreground)]"
                          >
                            {index + 1}. {condition || 'Empty condition'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-[var(--muted)]/20 rounded-lg">
                    <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">
                      Steps ({newTemplate.steps.length})
                    </h4>
                    {newTemplate.steps.length === 0 ? (
                      <div className="text-xs text-[var(--muted-foreground)]">
                        No steps defined
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {newTemplate.steps.map((step, index) => (
                          <div
                            key={index}
                            className="text-xs text-[var(--foreground)]"
                          >
                            {index + 1}. {step || 'Empty step'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-[var(--border)]">
              <Button
                variant="outline"
                onClick={() => setCreateStep(Math.max(1, createStep - 1))}
                disabled={createStep === 1}
              >
                Previous
              </Button>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-[var(--muted-foreground)]">
                  Step {createStep} of 5
                </span>
              </div>

              <div className="flex space-x-2">
                {createStep < 5 ? (
                  <Button onClick={() => setCreateStep(createStep + 1)}>
                    Next
                  </Button>
                ) : (
                  <Button>
                    <Check className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Spellbook
              </h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Audio workflow templates and recipes
              </p>
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
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((category) => {
                  const categoryCount = workflowTemplates.filter(
                    (t) => t.category === category.id
                  ).length;
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
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          selectedCategory === category.id
                            ? 'bg-[var(--primary-foreground)]/20 text-[var(--primary-foreground)]'
                            : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                        }`}
                      >
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
                onClick={handleCreateTemplate}
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
            {isCreatingTemplate ? (
              renderCreateTemplateView()
            ) : (
              <>
                {/* Template List */}
                <div className="w-80 border-r border-[var(--border)] overflow-y-auto">
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
                      {categories.find((c) => c.id === selectedCategory)?.name}{' '}
                      Templates
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
                        <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
                          Workflow Steps
                        </h4>
                        <div className="space-y-3">
                          {selectedTemplate.steps.map((step, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3"
                            >
                              <div className="w-6 h-6 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-[var(--foreground)]">
                                  {step}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={() =>
                            handleTemplateExecute(selectedTemplate)
                          }
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
