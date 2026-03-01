import Visualizer from "./Visualizer";
import SessionLog from "./SessionLog";

export default function Session({ status, logs, analyserRef, word, onStop }) {
  return (
    <div>
      <div className="card">
        {word && (
          <div className="word-badge">
            <span>Word:</span>
            <span className="badge-word">{word}</span>
          </div>
        )}

        <div className="status">
          <div className={`status-dot${status.state ? ` ${status.state}` : ""}`} />
          <span className="status-text">{status.text}</span>
        </div>

        <Visualizer analyserRef={analyserRef} />

        <div className="btn-row">
          <button className="btn btn-danger" onClick={onStop}>Stop</button>
        </div>
      </div>

      <SessionLog logs={logs} />
    </div>
  );
}
