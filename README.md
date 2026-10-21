# VisuaLearn - Interactive AI Networking Tutor

VisuaLearn is an interactive AI tutor that teaches computer networking using text explanations, animated interactive SVG diagrams, and a drawing whiteboard. Designed for learners of all ages, it adapts its vocabulary, analogies, and technical depth across three levels: **Little learner (6-10)**, **Student (11-17)**, and **Advanced (18+)**.

---

## Features

- **Text Explanations & Real-Life Analogies**: Bite-sized explanations under 150 words with memorable analogies (e.g. router as a postal sorting center, firewall as an airport security checkpoint).
- **Interactive Animated SVG Diagrams**: Fixed set of vector components (`computer`, `phone`, `router`, `switch`, `server`, `cloud`, `packet`, `firewall`, `cable`, `arrow`, `label`).
- **Full Playback Controls**: Play/Pause, Next/Prev step, Restart, Speed slider (0.5x, 1x, 2x), and step progress bar.
- **Voice Narration (Free Web Speech API)**: Speaks the text explanation and step narrations aloud in English with synchronized sentence highlighting. The animation waits for speech narration to finish before advancing.
- **Whiteboard / Student Drawing**:
  - Pen, highlighter, eraser, 6 colors, 3 stroke sizes, undo, redo, and clear.
  - Drawings are tied to each animation step.
  - Blank whiteboard mode for freeform notes.
  - **"Ask About This"**: Multimodal AI vision inspection where the student circles a part of the diagram and Gemini explains what was drawn!
- **Tutor Mode ("Teacher at the Whiteboard")**:
  - Click any element in the diagram to inspect its role.
  - Quick actions: "Break it down more", "Show me a simpler diagram", and "Give me an everyday example".
  - "Does that make sense now?" with Yes / Still confused loop.
- **Accounts & Saved History**:
  - Sign in with Google or Continue as Guest.
  - Automatically saves lesson topics, text explanations, diagram JSON, and student drawings per step.
  - History sidebar to search and reopen any past lesson.

---

## Getting Started Locally

### 1. Prerequisites
- Node.js (version 18 or higher recommended)
- npm or pnpm

### 2. Installation
Clone or extract the repository and install dependencies:

```bash
npm install
```

### 3. Add Your Gemini API Key
Create a `.env` file in the root directory (you can copy `.env.example`):

```bash
cp .env.example .env
```

Open `.env` and add your Google Gemini API key:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

> **Note:** VisuaLearn includes high-quality pre-packaged lessons for all 8 starter topics across all 3 age levels, so you can explore immediately even before configuring your key. Adding your key unlocks custom AI-generated networking topics, dynamic simpler diagrams, and multimodal whiteboard drawing inspection!

### 4. Run Development Server

```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## Architecture & Code Structure

```
├── firebase-blueprint.json    # Schema definition for Users and Lessons
├── firestore.rules            # Hardened Firestore ABAC security rules
├── index.html                 # HTML entry point with Plus Jakarta Sans & Outfit fonts
├── src/
│   ├── App.tsx                # Main sandbox layout orchestrating Stage, Whiteboard, and Tutor
│   ├── components/
│   │   ├── auth/              # Google Auth & Guest profile modal
│   │   ├── diagram/           # Animated SVG diagram renderer & playback controls
│   │   ├── history/           # Saved lessons history sidebar drawer
│   │   ├── layout/            # Top navigation bar conforming to the Top Bar contract
│   │   ├── tutor/             # Tutor whiteboard panel & comprehension check loop
│   │   └── whiteboard/        # Canvas drawing overlay & multimodal "Ask about this" modal
│   ├── server/
│   │   ├── apiRouter.ts       # Server-side HTTP request router
│   │   └── geminiService.ts   # Server-side @google/genai calls & schema validation
│   ├── services/
│   │   ├── authService.ts     # User authentication and profile state
│   │   ├── geminiClient.ts    # Frontend API client with fallback to starter curriculum
│   │   ├── speechService.ts   # Browser Web Speech API narration with sentence sync
│   │   └── storageService.ts  # Browser persistence and Firestore storage abstraction
│   ├── topics/                # Pre-packaged curriculum & extensible topic pack structure
│   └── types/                 # TypeScript interfaces and domain models
└── vite.config.ts             # Vite configuration with integrated server API middleware
```

---

## Firestore Security

Firestore rules (`firestore.rules`) enforce zero-trust access control:
- Each user can only read and write their own profile document (`/users/{userId}`).
- Each user can only read and write their own saved lessons and drawings (`/users/{userId}/lessons/{lessonId}`).
- Catch-all default deny prevents unauthorized reads or writes.
