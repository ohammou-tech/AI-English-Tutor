import { useEffect, useRef } from "react";

export default function SessionLog({ logs }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="log-card">
      <div className="log-title">Session Log</div>
      <div className="log-scroll" ref={scrollRef}>
        {logs.map((entry) => (
          <div key={entry.id} className={`log-entry${entry.cls ? ` ${entry.cls}` : ""}`}>
            {entry.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
