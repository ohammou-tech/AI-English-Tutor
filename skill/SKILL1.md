---
name: gemini-voice-english-tutor
description: >
  Build a real-time voice chat web app that uses the Gemini 2.5 Flash Native Audio Live API
  to teach English through natural spoken conversation. Use this skill whenever the user
  wants to create a voice-based AI English tutor, language learning app, speech practice tool,
  or any real-time bidirectional audio chat app powered by Gemini. Triggers on: "voice app",
  "voice chat with AI", "teach me English", "English tutor app", "Gemini Live API", "native audio",
  "real-time voice", "speech practice", "build English learning app", or any request combining
  microphone input, AI spoken responses, and language learning. When this skill triggers,
  Claude must immediately start writing and creating all the actual project files — do NOT just
  describe what to do, BUILD IT.
---

# Gemini Voice English Tutor — AI Build Instructions

When this skill triggers, your job is to **write and create all files** for a working voice-chat English tutor app. Do not describe the steps — execute them. Use `bash_tool`, `create_file`, and `present_files` to deliver a complete, runnable project.

---

## What to Build

A two-file Node.js app:
- `server.js` — Express + WebSocket backend that proxies audio to the Gemini Live API
- `public/index.html` — Browser frontend that captures mic audio and plays AI responses

The browser captures PCM audio from the microphone → sends it to the Node backend via WebSocket → the backend forwards it to Gemini Live API → Gemini responds with spoken audio → backend sends PCM back to browser → browser plays it. No separate STT or TTS — Gemini handles everything natively.

---

## Step 1 — Create the project directory and package.json

```bash
mkdir -p /home/claude/english-tutor/public
```

Write `package.json`:
```json
{
  "name": "english-tutor",
  "version": "1.0.0",
  "type": "module",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "@google/genai": "^1.0.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "ws": "^8.16.0"
  }
}
```

---

## Step 2 — Write server.js (copy this exactly)

```js
import { GoogleGenAI, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
app.use(cors());
app.use(express.static('public'));

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌  Set GEMINI_API_KEY environment variable before starting.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are Aria, an enthusiastic and patient English teacher.
Help the user practice spoken English naturally.
- Always respond in clear, natural English
- After each response, gently note ONE grammar or pronunciation tip if relevant
- Keep responses short and conversational (2-4 sentences)
- Encourage the user warmly
- If the user speaks another language, understand them but always reply in English
- Adapt to the user's apparent level`;

wss.on('connection', async (clientWs) => {
  console.log('🔗 Client connected');
  let session;

  try {
    session = await ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: SYSTEM_INSTRUCTION,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }
        }
      }
    });
    console.log('✅ Gemini session opened');
  } catch (err) {
    console.error('❌ Failed to open Gemini session:', err.message);
    clientWs.close();
    return;
  }

  // Browser audio → Gemini
  clientWs.on('message', (data) => {
    if (session && clientWs.readyState === WebSocket.OPEN) {
      session.sendRealtimeInput({
        audio: { data: Buffer.from(data).toString('base64'), mimeType: 'audio/pcm;rate=16000' }
      });
    }
  });

  // Gemini audio → browser
  (async () => {
    try {
      for await (const message of session) {
        const parts = message.serverContent?.modelTurn?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.mimeType?.startsWith('audio/pcm')) {
            const buf = Buffer.from(part.inlineData.data, 'base64');
            if (clientWs.readyState === WebSocket.OPEN) clientWs.send(buf);
          }
        }
      }
    } catch (err) {
      if (!err.message?.includes('closed')) console.error('Stream error:', err.message);
    }
  })();

  clientWs.on('close', () => { console.log('🔌 Client disconnected'); session?.close(); });
  clientWs.on('error', (e) => console.error('WS error:', e.message));
});

httpServer.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));
```

---

## Step 3 — Write public/index.html (copy this exactly)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>English Tutor AI 🎤</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
    }
    .card {
      background: white; border-radius: 24px; padding: 40px;
      width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    h1 { font-size: 1.8rem; color: #2d3748; margin-bottom: 6px; }
    .subtitle { color: #718096; margin-bottom: 28px; font-size: 0.95rem; }
    .status-bar {
      display: flex; align-items: center; gap: 10px;
      background: #f7fafc; border-radius: 12px; padding: 12px 16px;
      margin-bottom: 24px; font-size: 0.9rem; color: #4a5568;
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #cbd5e0; transition: all 0.3s; }
    .dot.connected { background: #48bb78; box-shadow: 0 0 8px #48bb7880; animation: pulse 1.5s infinite; }
    .dot.speaking  { background: #ed8936; box-shadow: 0 0 8px #ed893680; animation: pulse 0.7s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .controls { display: flex; gap: 12px; margin-bottom: 24px; }
    button {
      flex: 1; padding: 14px; border-radius: 12px; border: none;
      font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    #startBtn { background: #667eea; color: white; }
    #startBtn:hover { background: #5a67d8; transform: translateY(-1px); }
    #startBtn:disabled { background: #a0aec0; cursor: not-allowed; transform: none; }
    #stopBtn  { background: #fc8181; color: white; display: none; }
    #stopBtn:hover  { background: #f56565; transform: translateY(-1px); }
    .waveform {
      height: 60px; background: #f7fafc; border-radius: 12px;
      margin-bottom: 24px; display: flex; align-items: center; justify-content: center;
      gap: 3px; overflow: hidden;
    }
    .bar { width: 4px; background: #667eea; border-radius: 2px; height: 8px; transition: height 0.1s; }
    .log {
      background: #f7fafc; border-radius: 12px; padding: 16px;
      height: 180px; overflow-y: auto; font-size: 0.85rem; line-height: 1.7;
    }
    .log-entry { margin: 4px 0; }
    .log-entry.info  { color: #718096; }
    .log-entry.ready { color: #48bb78; font-weight: 600; }
    .log-entry.error { color: #f56565; }
    .tip { margin-top: 20px; font-size: 0.8rem; color: #a0aec0; text-align: center; }
  </style>
</head>
<body>
<div class="card">
  <h1>🎤 English Tutor AI</h1>
  <p class="subtitle">Powered by Gemini 2.5 Native Audio</p>

  <div class="status-bar">
    <div class="dot" id="dot"></div>
    <span id="statusText">Ready to connect</span>
  </div>

  <div class="controls">
    <button id="startBtn">▶ Start Session</button>
    <button id="stopBtn">⏹ Stop</button>
  </div>

  <div class="waveform" id="waveform">
    <!-- bars injected by JS -->
  </div>

  <div class="log" id="log">
    <div class="log-entry info">Welcome! Press Start Session, allow microphone access, and speak with your AI English tutor.</div>
  </div>

  <p class="tip">💡 Tip: Use headphones to prevent echo</p>
</div>

<script>
  const SAMPLE_RATE_IN  = 16000;
  const SAMPLE_RATE_OUT = 24000;

  let ws, mediaStream, audioCtx, micSource, processor;
  let playCtx, playQueue = [], isPlaying = false;
  let analyser, animFrame;

  // --- Waveform bars ---
  const waveform = document.getElementById('waveform');
  const NUM_BARS = 32;
  const bars = [];
  for (let i = 0; i < NUM_BARS; i++) {
    const b = document.createElement('div'); b.className = 'bar'; waveform.appendChild(b); bars.push(b);
  }

  function animateBars() {
    if (!analyser) { bars.forEach(b => b.style.height = '8px'); return; }
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    bars.forEach((b, i) => {
      const idx = Math.floor(i * data.length / NUM_BARS);
      const h = 8 + (data[idx] / 255) * 44;
      b.style.height = h + 'px';
    });
    animFrame = requestAnimationFrame(animateBars);
  }

  // --- Logging ---
  const logEl = document.getElementById('log');
  function log(msg, type = 'info') {
    const d = document.createElement('div'); d.className = `log-entry ${type}`; d.textContent = msg;
    logEl.appendChild(d); logEl.scrollTop = logEl.scrollHeight;
  }

  function setStatus(text, state) {
    document.getElementById('statusText').textContent = text;
    const dot = document.getElementById('dot');
    dot.className = 'dot' + (state ? ` ${state}` : '');
  }

  // --- PCM helpers ---
  function float32ToInt16(f32) {
    const i16 = new Int16Array(f32.length);
    for (let i = 0; i < f32.length; i++) i16[i] = Math.max(-32768, Math.min(32767, f32[i] * 32768));
    return i16;
  }

  // --- Audio playback queue ---
  function enqueue(int16) {
    const f32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) f32[i] = int16[i] / 32768;
    playQueue.push(f32);
    if (!isPlaying) playNext();
  }
  function playNext() {
    if (!playQueue.length) { isPlaying = false; return; }
    isPlaying = true;
    if (!playCtx || playCtx.state === 'closed') playCtx = new AudioContext({ sampleRate: SAMPLE_RATE_OUT });
    const f32 = playQueue.shift();
    const buf = playCtx.createBuffer(1, f32.length, SAMPLE_RATE_OUT);
    buf.copyToChannel(f32, 0);
    const src = playCtx.createBufferSource();
    src.buffer = buf; src.connect(playCtx.destination);
    src.onended = playNext; src.start();
  }

  // --- Start ---
  document.getElementById('startBtn').addEventListener('click', async () => {
    document.getElementById('startBtn').disabled = true;
    setStatus('Requesting microphone…', '');
    log('Requesting microphone access…');

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: SAMPLE_RATE_IN, channelCount: 1 } });
    } catch (e) {
      log('Microphone access denied: ' + e.message, 'error');
      setStatus('Microphone denied', ''); document.getElementById('startBtn').disabled = false; return;
    }

    audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE_IN });
    micSource = audioCtx.createMediaStreamSource(mediaStream);
    analyser  = audioCtx.createAnalyser(); analyser.fftSize = 64;
    micSource.connect(analyser);
    animateBars();

    const wsUrl = `ws://${location.host}`;
    ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      setStatus('Connected — speak now!', 'connected');
      log('✅ Connected to tutor Aria. Say hello!', 'ready');
      document.getElementById('startBtn').style.display = 'none';
      document.getElementById('stopBtn').style.display = 'block';

      processor = audioCtx.createScriptProcessor(2048, 1, 1);
      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const i16 = float32ToInt16(e.inputBuffer.getChannelData(0));
          ws.send(i16.buffer);
        }
      };
      micSource.connect(processor);
      processor.connect(audioCtx.destination);
    };

    ws.onmessage = (e) => {
      setStatus('Aria is speaking…', 'speaking');
      enqueue(new Int16Array(e.data));
      setTimeout(() => { if (ws?.readyState === WebSocket.OPEN) setStatus('Connected — speak now!', 'connected'); }, 2000);
    };

    ws.onerror = (e) => { log('WebSocket error', 'error'); };
    ws.onclose = () => { setStatus('Disconnected', ''); log('Session ended.'); cleanup(); };
  });

  // --- Stop ---
  document.getElementById('stopBtn').addEventListener('click', stopSession);

  function stopSession() {
    ws?.close(); cleanup();
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').style.display = 'none';
    setStatus('Ready to connect', '');
    log('Session stopped.');
  }

  function cleanup() {
    cancelAnimationFrame(animFrame); analyser = null;
    bars.forEach(b => b.style.height = '8px');
    processor?.disconnect(); micSource?.disconnect();
    mediaStream?.getTracks().forEach(t => t.stop());
    audioCtx?.close(); playCtx?.close();
    audioCtx = micSource = processor = mediaStream = ws = playCtx = null;
    playQueue = []; isPlaying = false;
  }
</script>
</body>
</html>
```

---

## Step 4 — Write a README.md

Include:
- Prerequisites: Node.js 18+, a Gemini API key from https://aistudio.google.com
- Install: `npm install`
- Run: `GEMINI_API_KEY=your_key node server.js`
- Open: http://localhost:3000
- Usage tip: use headphones to prevent echo
- Note about which model is used and what it does

---

## Step 5 — Output

After creating all files, copy the entire project folder to `/mnt/user-data/outputs/english-tutor/` and present the files to the user.

Tell the user:
1. What files were created
2. How to get a Gemini API key (https://aistudio.google.com)
3. The exact command to install and run: `npm install && GEMINI_API_KEY=your_key node server.js`
4. That they should use headphones

---

## Key Technical Facts

| Detail | Value |
|---|---|
| Model | `gemini-2.5-flash-native-audio-preview-12-2025` |
| Audio in | PCM 16-bit, 16kHz, mono |
| Audio out | PCM 16-bit, 24kHz, mono |
| SDK | `@google/genai` (npm) |
| Voice used | `Aoede` (warm, friendly) |
| Barge-in | Natively supported |

The Gemini Live API uses a persistent async iterator pattern. Always stream the response with `for await (const message of session)` and extract `message.serverContent.modelTurn.parts` looking for `inlineData` with `mimeType` starting with `audio/pcm`.
