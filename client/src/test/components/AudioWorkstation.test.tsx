import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioWorkstation } from '../../components/AudioWorkstation';

// Mock the useAudioWorkstation hook
vi.mock('../../hooks/useAudioWorkstation', () => ({
  useAudioWorkstation: vi.fn(() => ({
    transport: {
      isPlaying: false,
      isPaused: false,
      isStopped: true,
      isRecording: false,
      currentTime: 0,
      isLooping: false,
    },
    currentProject: {
      id: '1',
      name: 'Test Project',
      tracks: [],
      bpm: 120,
      timeSignature: [4, 4],
      sampleRate: 48000,
      bufferSize: 256,
      masterVolume: 75,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sessions: [],
    tracks: [],
    mixerChannels: [],
    aiAnalysis: null,
    aiSuggestions: [],
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    toggleRecording: vi.fn(),
    seekTo: vi.fn(),
    updateTrackVolume: vi.fn(),
    toggleTrackMute: vi.fn(),
    toggleTrackSolo: vi.fn(),
    switchSession: vi.fn(),
    setCurrentProject: vi.fn(),
    updateClipPosition: vi.fn(),
    updateClipProperties: vi.fn(),
  })),
}));

describe('AudioWorkstation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main workstation interface', () => {
    render(<AudioWorkstation />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('displays the transport controls', () => {
    render(<AudioWorkstation />);
    
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('shows the timeline editor by default', () => {
    render(<AudioWorkstation />);
    
    expect(screen.getByTestId('timeline-editor')).toBeInTheDocument();
  });

  it('switches between view modes', async () => {
    render(<AudioWorkstation />);
    
    const midiButton = screen.getByRole('button', { name: /midi/i });
    fireEvent.click(midiButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('midi-editor')).toBeInTheDocument();
    });
  });

  it('handles transport controls', () => {
    const mockPlay = vi.fn();
    const mockStop = vi.fn();
    
    vi.mocked(require('../../hooks/useAudioWorkstation').useAudioWorkstation).mockReturnValue({
      transport: { isPlaying: false, isStopped: true },
      play: mockPlay,
      stop: mockStop,
      currentProject: {},
      sessions: [],
      tracks: [],
      mixerChannels: [],
      aiAnalysis: null,
      aiSuggestions: [],
    });

    render(<AudioWorkstation />);
    
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(mockPlay).toHaveBeenCalled();
    
    fireEvent.click(screen.getByRole('button', { name: /stop/i }));
    expect(mockStop).toHaveBeenCalled();
  });

  it('displays project information', () => {
    render(<AudioWorkstation />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('handles accessibility requirements', () => {
    render(<AudioWorkstation />);
    
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveAttribute('aria-label');
    
    const playButton = screen.getByRole('button', { name: /play/i });
    expect(playButton).toHaveAttribute('aria-label');
  });
});