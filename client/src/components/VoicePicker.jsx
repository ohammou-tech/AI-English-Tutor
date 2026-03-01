import { VOICES } from "../data/wordBank";

export default function VoicePicker({ voice, onVoiceChange }) {
  return (
    <div className="voice-picker">
      <div className="voice-picker-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
          <path d="M19 11a7 7 0 0 1-14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
        Voice
      </div>
      <div className="voice-options">
        {VOICES.map((v) => (
          <button
            key={v.name}
            className={`voice-opt${voice === v.name ? " selected" : ""}`}
            onClick={() => onVoiceChange(v.name)}
          >
            {v.name} <span className="voice-gender">{v.gender}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
