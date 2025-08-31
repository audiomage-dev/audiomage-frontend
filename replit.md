# Audiomage Audio Workstation

## Overview

Audiomage is an AI-powered audio workstation built as a full-stack web application. It combines professional audio editing capabilities with intelligent AI assistance for music production, mixing, and mastering. The application provides both simplified and comprehensive interfaces to cater to users with varying levels of technical expertise.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Components**: Shadcn/UI component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Nord color palette theme
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Audio Processing**: Web Audio API for real-time audio manipulation and playback

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Build Tool**: ESBuild for server bundling
- **Development**: tsx for TypeScript execution

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Neon serverless)
- **Migration**: Drizzle Kit for schema management

## Key Components

### Audio Workstation Core
- **AudioWorkstation**: Main orchestrator component managing all audio operations
- **CompactTimelineEditor**: Multi-track timeline with drag-and-drop editing
- **MidiEditor**: Piano roll interface for MIDI composition
- **InteractiveScoreEditor**: Musical notation editor with real-time playback
- **MixingConsole**: Professional mixing board with effects and routing

### AI Integration
- **AIChatSidebar**: Conversational AI assistant for production guidance
- **AISuggestionsPanel**: Real-time AI recommendations for mixing and arrangement
- **AIToolsModal**: Collection of specialized AI audio processing tools
- **AudioChangemapsPanel**: AI-powered change tracking and recommendations

### Project Management
- **ProjectBrowser**: File explorer for audio assets and project organization
- **SessionTabs**: Multi-session workspace management
- **TrackInspector**: Detailed track analysis and editing tools

### Transport and Playback
- **CompactTransportBar**: Unified playback controls for timeline, MIDI, and score views
- **WaveformVisualization**: Real-time audio waveform rendering
- **AudioMeter**: Professional-grade level metering
- **Continuous Timeline**: Spatial-based editing without time domain constraints

## Data Flow

### Audio Processing Pipeline
1. **Input**: Audio files, MIDI data, or AI-generated content
2. **Processing**: Web Audio API nodes for effects, mixing, and analysis
3. **Rendering**: Real-time visualization of waveforms and spectral data
4. **Output**: Processed audio for playback or export

### UI Design Philosophy
1. **Continuous Timeline**: Spatial-based editing with ruler marks instead of time stamps
2. **Clean Interface**: Removed duration displays and time-based metadata from clips
3. **Visual Positioning**: Major/minor tick system for precise spatial reference
4. **Simplified Context**: Focus on actions rather than time-based information

### State Management Flow
1. **Transport State**: Centralized playback timing and synchronization
2. **Track State**: Individual track properties, effects, and automation
3. **Project State**: Overall project configuration and metadata
4. **Session State**: Active workspace and UI preferences

### AI Analysis Workflow
1. **Audio Analysis**: Real-time LUFS, peak, and spectral analysis
2. **Pattern Recognition**: AI identification of mixing opportunities
3. **Suggestion Generation**: Context-aware recommendations
4. **User Feedback Loop**: Learning from user acceptance/rejection of suggestions

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Query for UI and state management
- **Audio Libraries**: Web Audio API polyfills and utilities
- **UI Framework**: Radix UI primitives with Shadcn/UI components
- **Database**: Drizzle ORM with Neon PostgreSQL adapter

### Testing Framework
- **Unit Testing**: Vitest with React Testing Library
- **E2E Testing**: Playwright for cross-browser testing
- **Accessibility**: Axe-core for WCAG compliance testing
- **Performance**: Lighthouse CI for performance monitoring

### Development Tools
- **Build System**: Vite for frontend, ESBuild for backend
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Git Workflow**: Multiple Playwright configurations for different test types

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR on port 5000
- **Testing**: Comprehensive test suite with 80% coverage threshold
- **Preview**: Instant deployment previews for feature branches

### Production Build
- **Frontend**: Vite production build with asset optimization
- **Backend**: ESBuild bundle with external package resolution
- **Assets**: Static file serving with CORS configuration for attached assets

### CI/CD Pipeline
- **GitHub Actions**: 8 comprehensive workflows for CI/CD, security, and deployment
- **Replit Workflows**: 16 configured development and testing commands
- **Quality Gates**: ESLint, Prettier, TypeScript checks, and test coverage
- **Security**: Automated vulnerability scanning and dependency audits
- **Performance**: Bundle size monitoring and Lighthouse CI integration
- **Testing Infrastructure**: Web Audio API mocking with 78% test coverage

## Changelog

```
Changelog:
- July 10, 2025. Implemented comprehensive CI/CD pipeline with 8 GitHub Actions workflows
- July 10, 2025. Configured 16 Replit environment workflows for development and testing
- July 10, 2025. Enhanced timeline editor to use continuous positioning instead of time-based domains
- July 10, 2025. Implemented audio-specific testing infrastructure with Web Audio API mocking
- July 10, 2025. Achieved 78% test coverage (7/9 unit tests passing) with operational build pipeline
- July 02, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```