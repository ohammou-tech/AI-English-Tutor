import "dotenv/config";
import { GoogleGenAI, Modality } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import { createServer } from "http";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Set GEMINI_API_KEY environment variable before starting.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const FREE_TALK_INSTRUCTION = `You are Aria, an enthusiastic and patient English teacher.
Your goal is to help the user practice spoken English through natural conversation.

Rules:
- Always respond in clear, natural English
- Keep responses short and conversational (2-4 sentences max)
- If the user makes a grammar or pronunciation mistake, gently correct it after your response with a quick tip
- Adapt your vocabulary and pace to the user's apparent proficiency level
- Be warm, encouraging, and patient — celebrate small wins
- If the user speaks another language, understand them but always reply in English
- Ask follow-up questions to keep the conversation going
- Suggest better phrasing when appropriate

Start by greeting the user and asking what they'd like to practice today.`;

function buildWordPitchInstruction(word) {
  return `You are Aria, an enthusiastic and patient English teacher.
The student is playing a vocabulary game called "Word Pitch." The chosen word is: "${word}".

The student's job is to describe, explain, and pitch this word to you. Your job is to:
- Listen to their description and correct any grammar or vocabulary mistakes
- Suggest richer vocabulary and better phrasing related to this word
- Teach them useful expressions, synonyms, and collocations connected to "${word}"
- Ask follow-up questions to push them to describe the word more precisely and creatively
- If they use great vocabulary or expressions, praise them specifically

Rules:
- Always respond in clear, natural English
- Keep responses short and conversational (2-4 sentences max)
- Be warm, encouraging, and patient — celebrate improvements
- If the user speaks another language, understand them but always reply in English
- Adapt your vocabulary and pace to the user's proficiency level
- Focus the entire conversation around the word "${word}"

Start by saying: "Your word is ${word}! Tell me, what does this word mean to you? Try to describe it or use it in a sentence!"`;
}

const app = express();
app.use(express.static("public"));

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", async (clientWs, req) => {
  console.log("[ws] Client connected");
  let session = null;

  const url = new URL(req.url, `http://${req.headers.host}`);
  const mode = url.searchParams.get("mode") || "free_talk";
  const word = url.searchParams.get("word") || "";
  const instruction = mode === "word_pitch" && word
    ? buildWordPitchInstruction(word)
    : FREE_TALK_INSTRUCTION;
  console.log(`[ws] Mode: ${mode}${word ? `, Word: ${word}` : ""}`);

  try {
    session = await ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-12-2025",
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: instruction,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Aoede" },
          },
        },
      },
      callbacks: {
        onopen: () => {
          console.log("[gemini] Live session opened");
        },
        onmessage: (message) => {
          const parts = message.serverContent?.modelTurn?.parts ?? [];
          for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith("audio/pcm")) {
              const buf = Buffer.from(part.inlineData.data, "base64");
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(buf);
              }
            }
          }
        },
        onerror: (e) => {
          console.error("[gemini] Error:", e.message);
        },
        onclose: () => {
          console.log("[gemini] Session closed");
        },
      },
    });
  } catch (err) {
    console.error("[gemini] Failed to open session:", err.message);
    clientWs.close();
    return;
  }

  clientWs.on("message", (data) => {
    if (session && clientWs.readyState === WebSocket.OPEN) {
      const b64 = Buffer.from(data).toString("base64");
      session.sendRealtimeInput({
        audio: { data: b64, mimeType: "audio/pcm;rate=16000" },
      });
    }
  });

  clientWs.on("close", () => {
    console.log("[ws] Client disconnected");
    session?.close();
    session = null;
  });

  clientWs.on("error", (e) => console.error("[ws] Error:", e.message));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
