import { useState, useRef, useCallback } from "react";

const MIC_SAMPLE_RATE = 16000;
const PLAYBACK_SAMPLE_RATE = 24000;

function float32ToInt16(f32) {
  const out = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) {
    out[i] = Math.max(-32768, Math.min(32767, f32[i] * 32768));
  }
  return out;
}

export default function useAudioSession() {
  const [status, setStatus] = useState({ text: "Ready to connect", state: "" });
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const micSourceRef = useRef(null);
  const processorRef = useRef(null);
  const analyserRef = useRef(null);
  const playCtxRef = useRef(null);
  const nextPlayTimeRef = useRef(0);
  const animIdRef = useRef(null);
  const statusTimerRef = useRef(null);

  const addLog = useCallback((msg, cls = "") => {
    setLogs((prev) => [...prev, { msg, cls, id: Date.now() + Math.random() }]);
  }, []);

  const enqueueAudio = useCallback((int16Buf) => {
    if (!playCtxRef.current || playCtxRef.current.state === "closed") {
      playCtxRef.current = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
      nextPlayTimeRef.current = 0;
    }
    const f32 = new Float32Array(int16Buf.length);
    for (let i = 0; i < int16Buf.length; i++) f32[i] = int16Buf[i] / 32768;

    const ctx = playCtxRef.current;
    const buf = ctx.createBuffer(1, f32.length, PLAYBACK_SAMPLE_RATE);
    buf.copyToChannel(f32, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);

    const now = ctx.currentTime;
    if (nextPlayTimeRef.current < now) nextPlayTimeRef.current = now;
    src.start(nextPlayTimeRef.current);
    nextPlayTimeRef.current += buf.duration;
  }, []);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(animIdRef.current);
    analyserRef.current = null;
    processorRef.current?.disconnect();
    micSourceRef.current?.disconnect();
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    playCtxRef.current?.close();
    audioCtxRef.current = null;
    micSourceRef.current = null;
    processorRef.current = null;
    mediaStreamRef.current = null;
    wsRef.current = null;
    playCtxRef.current = null;
    nextPlayTimeRef.current = 0;
    setConnected(false);
  }, []);

  const startSession = useCallback(
    async (mode, voice, word) => {
      setLogs([]);
      setConnected(true);

      if (mode === "word_pitch" && word) {
        addLog(`Word Pitch mode — your word is: ${word}`, "warn");
      } else {
        addLog("Free Talk mode — say anything!", "ok");
      }

      setStatus({ text: "Requesting microphone...", state: "" });
      addLog("Requesting microphone access...");

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: MIC_SAMPLE_RATE,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      } catch (e) {
        addLog("Microphone denied: " + e.message, "err");
        setStatus({ text: "Microphone denied", state: "" });
        cleanup();
        return;
      }

      mediaStreamRef.current = stream;
      const actx = new AudioContext({ sampleRate: MIC_SAMPLE_RATE });
      audioCtxRef.current = actx;
      const micSource = actx.createMediaStreamSource(stream);
      micSourceRef.current = micSource;
      const analyser = actx.createAnalyser();
      analyser.fftSize = 128;
      micSource.connect(analyser);
      analyserRef.current = analyser;

      const isDev = import.meta.env.DEV;
      const wsHost = isDev ? `${location.hostname}:3001` : location.host;
      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      let wsUrl = `${proto}//${wsHost}?mode=${mode}&voice=${encodeURIComponent(voice)}`;
      if (mode === "word_pitch" && word) {
        wsUrl += `&word=${encodeURIComponent(word)}`;
      }
      const ws = new WebSocket(wsUrl);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus({ text: "Connected — speak now!", state: "live" });
        addLog("Connected to Aria. Go ahead and speak!", "ok");

        const processor = actx.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const pcm = float32ToInt16(e.inputBuffer.getChannelData(0));
            ws.send(pcm.buffer);
          }
        };
        micSource.connect(processor);
        processor.connect(actx.destination);
        processorRef.current = processor;
      };

      ws.onmessage = (e) => {
        setStatus({ text: "Aria is speaking...", state: "speaking" });
        enqueueAudio(new Int16Array(e.data));
        clearTimeout(statusTimerRef.current);
        statusTimerRef.current = setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            setStatus({ text: "Connected — speak now!", state: "live" });
          }
        }, 1500);
      };

      ws.onerror = () => addLog("Connection error", "err");

      ws.onclose = () => {
        setStatus({ text: "Disconnected", state: "" });
        addLog("Session ended.");
        cleanup();
      };
    },
    [addLog, enqueueAudio, cleanup]
  );

  const stopSession = useCallback(() => {
    wsRef.current?.close();
    cleanup();
    addLog("Session stopped.");
    setStatus({ text: "Ready to connect", state: "" });
  }, [cleanup, addLog]);

  return {
    status,
    logs,
    connected,
    analyserRef,
    startSession,
    stopSession,
  };
}
