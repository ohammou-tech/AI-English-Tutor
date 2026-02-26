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

const SYSTEM_INSTRUCTION = `You are Aria, an enthusiastic and patient English teacher.
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

const app = express();
app.use(express.static("public"));

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", async (clientWs) => {
  console.log("[ws] Client connected");
  let session = null;

  try {
    session = await ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-12-2025",
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: SYSTEM_INSTRUCTION,
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

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
