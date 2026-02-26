---
name: gemini-voice-english-tutor
description: >
  Build a real-time voice chat web app that uses the Gemini 2.5 Flash Native Audio Live API
  to teach English through natural spoken conversation. Use this skill whenever the user
  wants to create a voice-based AI English tutor, language learning app, speech practice tool,
  or any real-time bidirectional audio chat app powered by Gemini. Triggers on: "voice app",
  "voice chat with AI", "teach me English", "English tutor app", "Gemini Live API", "native audio",
  "real-time voice", "speech practice", "build English learning app", or any request combining
  microphone input, AI spoken responses, and language learning.
---

# Gemini Voice English Tutor — Skill Context

This skill gives you the essential knowledge to build a voice-chat English tutor app powered by the **Gemini 2.5 Flash Native Audio Live API**. Use this context to design and build the best possible app — you have full creative freedom over architecture, UI, features, and code style.

---

## Goal

Build a real-time voice app where the user speaks into their microphone and an AI English tutor responds with spoken audio. The AI listens, understands, and replies naturally — no separate speech-to-text or text-to-speech pipeline needed. Gemini handles it all natively.

---

## How the Gemini Live Audio API Works

The Gemini Live API is a **persistent WebSocket-based session** that streams raw PCM audio both ways in real time.

**Key facts:**
- Model to use: `gemini-2.5-flash-native-audio-preview-12-2025`
- NPM package: `@google/genai`
- Open a session with `ai.live.connect({ model, config })`
- Send mic audio with `session.sendRealtimeInput({ audio: { data: base64PCM, mimeType: 'audio/pcm;rate=16000' } })`
- Receive audio by iterating: `for await (const message of session)`
- Response audio lives in: `message.serverContent.modelTurn.parts[].inlineData` where `mimeType` starts with `audio/pcm`
- Input audio format: PCM 16-bit, 16kHz, mono
- Output audio format: PCM 16-bit, 24kHz, mono
- The API key must **never** be exposed to the browser — always proxy through a backend
- Barge-in (user interrupting the AI mid-sentence) is supported natively
- Available voices include: Aoede, Charon, Fenrir, Kore, Puck (and many more)
- Set voice via `config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName`
- Set response type via `config.responseModalities: [Modality.AUDIO]`
- Provide a tutor persona via `config.systemInstruction`

---

## English Tutor Persona Ideas

The app should teach English through natural conversation. Consider prompting the AI to:
- Always respond in clear, natural English regardless of what language the user speaks
- Gently correct grammar mistakes and suggest better phrasing
- Adapt its vocabulary and pace to the user's apparent proficiency level
- Be warm, encouraging, and patient
- Offer pronunciation tips when relevant
- Keep responses conversational and not too long

---

## Architecture Guidance

The browser cannot call the Gemini API directly (API key security). A common approach:
- A **backend** (e.g. Node.js) holds the API key, opens the Gemini Live session, and relays audio over WebSockets
- The **frontend** captures mic audio using the Web Audio API / MediaStream API, sends PCM chunks to the backend, and plays back received PCM using AudioContext

You are free to choose any stack, structure, or architecture you think is best.

---

## UX Suggestions

Think about what makes a great language learning experience:
- Clear visual feedback (is the AI listening? speaking? idle?)
- Easy start/stop controls
- A session log or transcript (optional but helpful)
- Friendly, welcoming design
- Headphone reminder (to avoid echo/feedback)

---

## Delivery

When you're done building, provide all files in a runnable state and tell the user:
- How to get a Gemini API key: https://aistudio.google.com
- How to install dependencies and run the app
- Any important usage notes (e.g. use headphones)
