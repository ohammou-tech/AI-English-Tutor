export default function WordPreview({ word, onNewWord, onBack, onStart }) {
  return (
    <div className="card word-display">
      <div className="word-label">Your word</div>
      <div className="word-value">{word.word}</div>
      <div className="word-category">{word.cat}</div>
      <div className="word-actions">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <button className="btn-ghost" onClick={onNewWord}>New Word</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onStart}>
          Start Session
        </button>
      </div>
    </div>
  );
}
