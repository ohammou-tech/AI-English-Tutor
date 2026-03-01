import VoicePicker from "./VoicePicker";

export default function ModeSelect({ voice, onVoiceChange, onFreeTalk, onWordPitch }) {
  return (
    <div>
      <div className="mode-grid">
        <div className="mode-card" onClick={onFreeTalk}>
          <div className="mode-icon icon-talk">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="9" y1="10" x2="9" y2="10" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="10" x2="12" y2="10" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="15" y1="10" x2="15" y2="10" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mode-label">Free Talk</div>
          <div className="mode-desc">Practice natural conversation on any topic</div>
        </div>

        <div className="mode-card" onClick={onWordPitch}>
          <div className="mode-icon icon-pitch">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="mode-label">Word Pitch</div>
          <div className="mode-desc">Describe a random word &amp; build vocabulary</div>
        </div>
      </div>

      <VoicePicker voice={voice} onVoiceChange={onVoiceChange} />
    </div>
  );
}
