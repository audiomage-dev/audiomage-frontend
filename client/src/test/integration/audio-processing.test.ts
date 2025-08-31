import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { AudioWorkstation } from '../../components/AudioWorkstation';

// Integration tests for audio processing workflows
describe('Audio Processing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Web Audio API for integration tests
    global.AudioContext = vi.fn().mockImplementation(() => ({
      createGain: vi.fn().mockReturnValue({
        gain: { value: 1 },
        connect: vi.fn(),
        disconnect: vi.fn(),
      }),
      createOscillator: vi.fn().mockReturnValue({
        frequency: { value: 440 },
        type: 'sine',
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }),
      createAnalyser: vi.fn().mockReturnValue({
        fftSize: 2048,
        frequencyBinCount: 1024,
        getFloatFrequencyData: vi.fn(),
        getByteFrequencyData: vi.fn(),
        connect: vi.fn(),
      }),
      destination: {},
      sampleRate: 48000,
      currentTime: 0,
      state: 'running',
      resume: vi.fn().mockResolvedValue(undefined),
    }));
  });

  it('should handle complete audio workflow from file upload to playback', async () => {
    // Mock file upload API
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/upload')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              fileId: 'test-audio-file',
              waveformData: new Array(1000).fill(0).map(() => Math.random()),
            }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const { container } = render(React.createElement(AudioWorkstation));

    // Simulate file upload
    const fileInput = container.querySelector('input[type="file"]');
    if (fileInput) {
      const file = new File(['audio data'], 'test.wav', { type: 'audio/wav' });
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/upload'),
        expect.any(Object)
      );
    });
  });

  it('should process MIDI data and convert to audio', async () => {
    const midiData = {
      tracks: [
        {
          id: 'midi-track-1',
          notes: [
            { pitch: 60, velocity: 100, startTime: 0, duration: 1 },
            { pitch: 64, velocity: 80, startTime: 1, duration: 1 },
            { pitch: 67, velocity: 90, startTime: 2, duration: 1 },
          ],
        },
      ],
    };

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/midi/process')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              audioData: new ArrayBuffer(1024),
              waveformData: new Array(500).fill(0).map(() => Math.random()),
            }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const response = await fetch('/api/midi/process', {
      method: 'POST',
      body: JSON.stringify(midiData),
    });

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.audioData).toBeInstanceOf(ArrayBuffer);
  });

  it('should handle real-time audio recording and processing', async () => {
    // Mock MediaRecorder
    global.MediaRecorder = vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      state: 'inactive',
    }));

    global.navigator.mediaDevices.getUserMedia = vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([
        {
          kind: 'audio',
          stop: vi.fn(),
        },
      ]),
    });

    const { container } = render(React.createElement(AudioWorkstation));

    // Start recording
    const recordButton = container.querySelector(
      '[data-testid="record-button"]'
    );
    if (recordButton) {
      recordButton.dispatchEvent(new Event('click', { bubbles: true }));
    }

    await waitFor(() => {
      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
      });
    });
  });

  it('should apply audio effects and maintain quality', async () => {
    const audioBuffer = new ArrayBuffer(1024);
    const effectConfig = {
      type: 'reverb',
      parameters: {
        roomSize: 0.5,
        damping: 0.3,
        wetLevel: 0.4,
      },
    };

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/effects/apply')) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const response = await fetch('/api/effects/apply', {
      method: 'POST',
      body: JSON.stringify({
        audioData: Array.from(new Uint8Array(audioBuffer)),
        effect: effectConfig,
      }),
    });

    const processedAudio = await response.arrayBuffer();
    expect(processedAudio).toBeInstanceOf(ArrayBuffer);
    expect(processedAudio.byteLength).toBe(1024);
  });

  it('should synchronize multiple audio tracks accurately', async () => {
    const tracks = [
      { id: 'track-1', startTime: 0, duration: 10 },
      { id: 'track-2', startTime: 2, duration: 8 },
      { id: 'track-3', startTime: 5, duration: 5 },
    ];

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/mix/sync')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              mixedAudio: new ArrayBuffer(2048),
              timing: {
                totalDuration: 10,
                syncPoints: [0, 2, 5],
              },
            }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const response = await fetch('/api/mix/sync', {
      method: 'POST',
      body: JSON.stringify({ tracks }),
    });

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.timing.syncPoints).toEqual([0, 2, 5]);
  });

  it('should handle audio format conversion', async () => {
    const formats = ['wav', 'mp3', 'flac', 'aac'];

    for (const format of formats) {
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes(`/api/convert/${format}`)) {
          return Promise.resolve({
            ok: true,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(512)),
            headers: {
              get: (name: string) => {
                if (name === 'content-type') {
                  return `audio/${format}`;
                }
                return null;
              },
            },
          });
        }
        return Promise.resolve({ ok: false });
      });

      const response = await fetch(`/api/convert/${format}`, {
        method: 'POST',
        body: new ArrayBuffer(1024),
      });

      expect(response.ok).toBe(true);
      const convertedAudio = await response.arrayBuffer();
      expect(convertedAudio).toBeInstanceOf(ArrayBuffer);
    }
  });

  it('should maintain audio quality during processing chain', async () => {
    const originalAudio = new ArrayBuffer(2048);
    const processingSteps = ['normalize', 'eq', 'compression', 'reverb'];

    let currentAudio = originalAudio;

    for (const step of processingSteps) {
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes(`/api/process/${step}`)) {
          return Promise.resolve({
            ok: true,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(2048)),
            json: () =>
              Promise.resolve({
                qualityMetrics: {
                  dynamicRange: 85,
                  peakLevel: -3,
                  rmsLevel: -18,
                  thd: 0.001,
                },
              }),
          });
        }
        return Promise.resolve({ ok: false });
      });

      const response = await fetch(`/api/process/${step}`, {
        method: 'POST',
        body: currentAudio,
      });

      expect(response.ok).toBe(true);
      currentAudio = await response.arrayBuffer();

      const metrics = await response.json();
      expect(metrics.qualityMetrics.thd).toBeLessThan(0.01); // Low distortion
    }
  });
});
