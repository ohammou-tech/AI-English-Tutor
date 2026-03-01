import { useState, useCallback } from "react";
import Header from "../components/Header";
import ModeSelect from "../components/ModeSelect";
import WordPreview from "../components/WordPreview";
import Session from "../components/Session";
import Tip from "../components/Tip";
import { pickRandomWord } from "../data/wordBank";
import useAudioSession from "../hooks/useAudioSession";

export default function Tutor() {
  const [view, setView] = useState("mode");
  const [voice, setVoice] = useState("Puck");
  const [currentWord, setCurrentWord] = useState(null);
  const [sessionMode, setSessionMode] = useState("free_talk");

  const { status, logs, connected, analyserRef, startSession, stopSession } =
    useAudioSession();

  const handleFreeTalk = useCallback(() => {
    setSessionMode("free_talk");
    setCurrentWord(null);
    setView("session");
    startSession("free_talk", voice, null);
  }, [voice, startSession]);

  const handleWordPitch = useCallback(() => {
    setSessionMode("word_pitch");
    const w = pickRandomWord();
    setCurrentWord(w);
    setView("word");
  }, []);

  const handleNewWord = useCallback(() => {
    setCurrentWord(pickRandomWord());
  }, []);

  const handleStartWord = useCallback(() => {
    setView("session");
    startSession("word_pitch", voice, currentWord?.word);
  }, [voice, currentWord, startSession]);

  const handleBack = useCallback(() => {
    setView("mode");
    setCurrentWord(null);
  }, []);

  const handleStop = useCallback(() => {
    stopSession();
    setView("mode");
  }, [stopSession]);

  return (
    <>
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />
      <div className="ambient-title" />

      <div className="container">
        <Header />

        {view === "mode" && (
          <ModeSelect
            voice={voice}
            onVoiceChange={setVoice}
            onFreeTalk={handleFreeTalk}
            onWordPitch={handleWordPitch}
          />
        )}

        {view === "word" && currentWord && (
          <WordPreview
            word={currentWord}
            onNewWord={handleNewWord}
            onBack={handleBack}
            onStart={handleStartWord}
          />
        )}

        {view === "session" && (
          <Session
            status={status}
            logs={logs}
            analyserRef={analyserRef}
            word={sessionMode === "word_pitch" ? currentWord?.word : null}
            onStop={handleStop}
          />
        )}

        <Tip />
      </div>
    </>
  );
}
