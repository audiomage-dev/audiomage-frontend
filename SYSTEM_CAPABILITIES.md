# AudioMage System Routes & Features

## Feature Overview
Multi-session AI audio workstation with comprehensive production tools.

---

## Session Management

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| List Sessions | `/api/sessions` | GET | `Session[]` | Retrieve all audio production sessions |
| Create Session | `/api/sessions` | POST | `InsertSession` | Create new session with project association |
| Switch Session | `/api/sessions/:id/activate` | PUT | `Session` | Activate different session context |
| Session State | `/api/sessions/:id/state` | GET | `SessionState` | Get current session transport and UI state |

**Session Schema:**
- id: Session identifier
- projectId: Associated project
- name: Session file name (Film_Mix_v3.amp, Podcast_master.amp)
- isActive: Current active session
- lastAccessed: Last usage timestamp

---

## Project Management

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| List Projects | `/api/projects` | GET | `Project[]` | All projects with metadata |
| Create Project | `/api/projects` | POST | `InsertProject` | New project with audio settings |
| Get Project Details | `/api/projects/:id` | GET | `ProjectDetail` | Full project with tracks and settings |
| Update Project | `/api/projects/:id` | PATCH | `ProjectUpdate` | Modify project parameters |
| Delete Project | `/api/projects/:id` | DELETE | - | Remove project and dependencies |

**Project Schema:**
- id: Project identifier
- name: Project display name
- bpm: Beats per minute (tempo)
- timeSignature: Time signature array [numerator, denominator]
- sampleRate: Audio sample rate (44100, 48000, 96000, 192000)
- bufferSize: Audio buffer size (128, 256, 512, 1024)
- masterVolume: Master output level (0-100)
- createdAt: Creation timestamp
- updatedAt: Last modification timestamp

---

## Audio Track Management

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| List Tracks | `/api/projects/:id/tracks` | GET | `AudioTrack[]` | All tracks in project |
| Create Track | `/api/projects/:id/tracks` | POST | `InsertAudioTrack` | Add new audio/MIDI track |
| Update Track | `/api/tracks/:id` | PATCH | `TrackUpdate` | Modify track properties |
| Delete Track | `/api/tracks/:id` | DELETE | - | Remove track from project |
| Track Analysis | `/api/tracks/:id/analysis` | GET | `AudioAnalysis` | Spectral data and recommendations |

**AudioTrack Schema:**
- id: Track identifier
- name: Track display name
- type: Track type (audio, midi, ai-generated)
- filePath: Audio file location
- position: Timeline position in seconds
- volume: Track volume level (0-100)
- pan: Stereo pan position (0-100, 50=center)
- muted: Track mute state
- soloed: Track solo state
- color: Timeline display color (hex)
- waveformData: Visual waveform points
- effects: Applied audio effects array

---

## File System Operations

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| Browse Files | `/api/files` | GET | `ProjectItem[]` | Hierarchical file browser |
| Upload Audio | `/api/files/upload` | POST | `FileUpload` | Multi-part audio file upload |
| File Details | `/api/files/:id` | GET | `FileDetail` | Metadata and audio properties |
| Move Files | `/api/files/:id/move` | PUT | `FileMoveRequest` | Reorganize project structure |
| Delete Files | `/api/files/:id` | DELETE | - | Remove files from project |

**ProjectItem Schema:**
- id: File/folder identifier
- name: Display name
- type: Item type (audio, midi, folder, project, fx, samples, file)
- children: Nested items array
- level: Hierarchy depth
- size: File size in bytes
- duration: Audio duration in seconds
- sampleRate: Audio sample rate

---

## Search & Discovery

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| Global Search | `/api/search` | GET | `SearchResult[]` | Search across projects, tracks, files |
| Search Filters | `/api/search/filters` | GET | `SearchFilters` | Available filter categories |
| Advanced Search | `/api/search/advanced` | POST | `AdvancedSearchRequest` | Complex search with multiple criteria |
| Search History | `/api/search/history` | GET | `SearchHistory[]` | Recent searches for session |

**SearchResult Schema:**
- type: Result type (project, track, file, effect, session)
- id: Item identifier
- name: Item name
- projectName: Parent project name
- relevance: Match score (0.0 - 1.0)
- highlights: Highlighted search matches
- metadata: Additional context data

---

## Version Control & History

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| Version History | `/api/versions` | GET | `ProjectVersion[]` | Git-like project history |
| Create Version | `/api/versions` | POST | `VersionCreate` | Commit current project state |
| Restore Version | `/api/versions/:id/restore` | POST | `RestoreResult` | Revert to previous version |
| Compare Versions | `/api/versions/compare` | GET | `VersionDiff` | Show differences between versions |
| Branch Operations | `/api/versions/branches` | GET/POST | `Branch[]` | Manage project branches |

**ProjectVersion Schema:**
- id: Version identifier
- hash: Unique version hash
- message: Commit message
- author: Version author
- timestamp: Creation time
- type: Version type (commit, merge, tag)
- branch: Git branch name
- parents: Parent version hashes
- isCurrent: Currently active version
- isHead: Latest version flag
- changes: File change summary (added, modified, deleted)

---

## Audio Changemaps

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| Track Changemaps | `/api/changemaps` | GET | `TrackChangemap[]` | Detailed modification history |
| Change Details | `/api/changemaps/:id` | GET | `AudioChange` | Specific change information |
| Revert Change | `/api/changemaps/:id/revert` | POST | `RevertResult` | Undo specific modification |
| Change Statistics | `/api/changemaps/stats` | GET | `ChangeStats` | Aggregated change analytics |

**AudioChange Schema:**
- id: Change identifier
- timestamp: When change occurred
- action: Type of modification (effect_added, volume_adjusted, etc.)
- property: Modified property (reverb, gain, eq, etc.)
- oldValue: Previous value
- newValue: New value
- applied: Change status
- description: Human-readable description

---

## AI Sound Library

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| Browse Sounds | `/api/library/sounds` | GET | `SoundLibraryResponse` | Paginated sound collection |
| Sound Categories | `/api/library/categories` | GET | `SoundCategory[]` | Hierarchical categories |
| Search Sounds | `/api/library/search` | GET | `SoundSearchResult[]` | Advanced sound search |
| Download Sound | `/api/library/sounds/:id/download` | GET | `File` | Download audio file |
| Preview Sound | `/api/library/sounds/:id/preview` | GET | `File` | Low-quality preview |
| Favorite Sound | `/api/library/sounds/:id/favorite` | POST | `FavoriteResult` | Add to favorites |

**Sound Schema:**
- id: Sound identifier
- name: Sound filename (Rain on Leaves Heavy.wav)
- category: Sound category (Nature & Weather)
- duration: Length in seconds
- tags: Descriptive tags array (rain, nature, ambient)
- popular: Trending/popular status
- sampleRate: Audio sample rate
- bitDepth: Audio bit depth
- fileSize: File size in bytes
- downloadUrl: Download endpoint
- previewUrl: Preview endpoint

**Sound Categories:**
- Nature & Weather (2,156 sounds)
- Urban & City (1,843 sounds)
- Mechanical & Tech (2,934 sounds)
- Human Activities (1,567 sounds)
- Musical Elements (987 sounds)
- Abstract & Designed (756 sounds)
- Animals & Creatures (634 sounds)
- Vehicles & Transport (1,245 sounds)

---

## AI Chat Integration

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| Send Message | `/api/chat/sessions/:id/messages` | POST | `ChatMessage` | Send message to AI assistant |
| Chat History | `/api/chat/sessions/:id/history` | GET | `ChatMessage[]` | Retrieve conversation history |
| Clear Chat | `/api/chat/sessions/:id/clear` | DELETE | - | Clear session chat history |
| Chat Context | `/api/chat/sessions/:id/context` | GET | `ChatContext` | Current session context |

**ChatMessage Object:**
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionId: string;
}
```

---

## Audio Processing & Analysis

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| Audio Analysis | `/api/audio/tracks/:id/analysis` | GET | `AIAnalysis` | Spectral and frequency analysis |
| Apply Effects | `/api/audio/tracks/:id/effects` | POST | `EffectApplication` | Add/modify audio effects |
| Render Audio | `/api/audio/tracks/:id/render` | POST | `RenderRequest` | Export processed audio |
| Waveform Data | `/api/audio/tracks/:id/waveform` | GET | `WaveformData` | Visual waveform points |

**AIAnalysis Object:**
```typescript
interface AIAnalysis {
  spectralData: number[];
  peakFrequency: number;
  recommendations: string[];
  lufs: number;         // Loudness units
  peak: number;         // Peak level in dB
  isProcessing: boolean;
}
```

---

## Transport Control

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| Play | `/api/transport/:sessionId/play` | POST | `TransportState` | Start playback |
| Pause | `/api/transport/:sessionId/pause` | POST | `TransportState` | Pause playback |
| Stop | `/api/transport/:sessionId/stop` | POST | `TransportState` | Stop and return to start |
| Record | `/api/transport/:sessionId/record` | POST | `TransportState` | Start recording |
| Seek | `/api/transport/:sessionId/seek` | POST | `SeekRequest` | Jump to time position |
| Transport Status | `/api/transport/:sessionId/status` | GET | `TransportState` | Current playback state |

**TransportState Object:**
```typescript
interface TransportState {
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  isRecording: boolean;
  currentTime: number;  // Seconds
  loopStart?: number;
  loopEnd?: number;
  isLooping: boolean;
}
```

---

## Mixing Console

| Functionality | Route | Method | Object Schema | Description |
|---------------|-------|--------|---------------|-------------|
| Channel States | `/api/mixer/channels` | GET | `MixerChannel[]` | All mixer channel settings |
| Update Channel | `/api/mixer/channels/:id` | PATCH | `ChannelUpdate` | Modify channel parameters |
| Master Section | `/api/mixer/master` | GET | `MasterSection` | Master bus controls |
| Send Effects | `/api/mixer/sends` | GET | `SendEffect[]` | Auxiliary send effects |

**MixerChannel Object:**
```typescript
interface MixerChannel {
  id: string;
  trackId: string;
  name: string;
  volume: number;       // 0-100
  pan: number;         // 0-100
  muted: boolean;
  soloed: boolean;
  gain: number;        // Input gain
  sends: Record<string, number>;
  eq: {
    highFreq: number;
    midFreq: number;
    lowFreq: number;
  };
  effects: AudioEffect[];
}
```

---

## Real-time WebSocket Events

| Event Type | Payload | Description |
|------------|---------|-------------|
| `transport_update` | `TransportState` | Playback position changes |
| `track_modified` | `TrackUpdate` | Track parameter changes |
| `chat_message` | `ChatMessage` | New AI chat messages |
| `session_switched` | `SessionChange` | Active session changed |
| `project_saved` | `SaveResult` | Project save completion |
| `audio_analysis_complete` | `AIAnalysis` | Audio processing finished |
| `collaboration_update` | `CollabUpdate` | Multi-user changes |

---

## User Interface Components

| Component | Data Source | Capabilities |
|-----------|-------------|--------------|
| **SessionTabs** | `/api/sessions` | Switch between Film_Mix_v3.amp, Podcast_master.amp |
| **MenuBar** | Local state | File operations, theme switching, command palette |
| **VerticalSidebar** | Multiple APIs | Project browser, AI suggestions, changemaps, library |
| **CompactTimelineEditor** | `/api/projects/:id/tracks` | Multi-track editing, waveform display, selections |
| **TrackInspector** | `/api/tracks/:id` | Channel strip, effects, EQ, sends, analysis |
| **AIChatSidebar** | `/api/chat/sessions/:id` | Session-aware AI assistance |
| **MixingConsole** | `/api/mixer/channels` | Professional mixing controls |
| **StatusBar** | Multiple sources | Project status, AI analysis, save state |

---

## Data Flow Architecture

```
Frontend (React/TypeScript)
    ↕ HTTP/WebSocket
Backend (Express/TypeScript)
    ↕ Drizzle ORM
PostgreSQL Database
    ↕ File System
Audio Files & Projects
```

---

## Authentication & Security

| Route | Method | Auth Required | Permission Level |
|-------|--------|---------------|------------------|
| All `/api/sessions/*` | * | Yes | Session owner |
| All `/api/projects/*` | * | Yes | Project collaborator |
| All `/api/files/*` | * | Yes | Project access |
| `/api/library/*` | GET | No | Public library |
| `/api/chat/*` | * | Yes | Session participant |

---

## Performance Specifications

| Metric | Target | Current Implementation |
|--------|--------|----------------------|
| Audio Latency | <10ms | Optimized buffer sizes |
| File Upload | 500MB max | Multi-part chunked upload |
| Search Response | <200ms | Indexed full-text search |
| Real-time Updates | <50ms | WebSocket push notifications |
| Concurrent Sessions | 100+ | Session-based isolation |
| Library Sounds | 12,847+ | Paginated lazy loading |

---

## Integration Points

| Service | Purpose | Authentication |
|---------|---------|---------------|
| **Perplexity API** | AI chat assistance | API key required |
| **Audio Processing** | Waveform analysis | Local processing |
| **File Storage** | Audio file management | File system permissions |
| **Database** | Persistent state | Connection pooling |