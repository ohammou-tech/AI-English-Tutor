# Aria — AI English Tutor

A real-time voice chat app that teaches English through natural spoken conversation, powered by the **Gemini 2.5 Flash Native Audio Live API**.

Speak into your microphone and Aria, your AI English tutor, responds with voice in real time. No separate speech-to-text or text-to-speech — Gemini handles everything natively.

## Prerequisites

- **Node.js 18+**
- **Gemini API key** — get one free at [https://aistudio.google.com](https://aistudio.google.com)

## Setup

```bash
npm install
```

## Run

```bash
GEMINI_API_KEY=your_api_key_here npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click **Start Session**
2. Allow microphone access when prompted
3. Start speaking — Aria will respond in real time
4. Click **Stop** to end the session

## Important Notes

- **Use headphones** to prevent echo/audio feedback
- The app uses the `gemini-2.5-flash-native-audio-preview-12-2025` model with the `Aoede` voice
- Audio is streamed bidirectionally over WebSocket — your voice goes to Gemini and Aria's voice comes back in real time
- Barge-in is supported: you can interrupt Aria mid-sentence and she'll adapt
