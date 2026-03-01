import { useEffect, useRef } from "react";

const NUM_BARS = 40;

export default function Visualizer({ analyserRef }) {
  const barsRef = useRef([]);
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = "";
    barsRef.current = Array.from({ length: NUM_BARS }, () => {
      const b = document.createElement("div");
      b.className = "vis-bar";
      el.appendChild(b);
      return b;
    });

    function animate() {
      const analyser = analyserRef.current;
      if (!analyser) {
        barsRef.current.forEach((b) => {
          b.style.height = "6px";
          b.classList.remove("active");
        });
        animRef.current = requestAnimationFrame(animate);
        return;
      }
      const freq = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freq);
      const step = freq.length / NUM_BARS;
      barsRef.current.forEach((b, i) => {
        const val = freq[Math.floor(i * step)] / 255;
        b.style.height = 6 + val * 60 + "px";
        b.classList.toggle("active", val > 0.15);
      });
      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [analyserRef]);

  return <div className="visualizer" ref={containerRef} />;
}
