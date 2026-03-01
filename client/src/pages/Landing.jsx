import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

export default function Landing() {
  const navRef = useRef(null);
  const waveRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      navRef.current?.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = waveRef.current;
    if (!el) return;
    for (let i = 0; i < 36; i++) {
      const bar = document.createElement("div");
      bar.className = "mock-wave-bar";
      bar.style.animationDelay = `${i * 0.06}s`;
      bar.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
      el.appendChild(bar);
    }
  }, []);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav" ref={navRef}>
        <div className="nav-inner">
          <div className="nav-brand">Aria</div>
          <ul className="nav-links">
            <li><a href="#how">How it works</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#tech">Technology</a></li>
            <li><Link to="/app" className="nav-cta">Launch App</Link></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div>
          <div className="hero-badge reveal">
            <span className="hero-badge-dot" />
            Real-time voice — no typing needed
          </div>
          <h1 className="reveal reveal-delay-1">
            Master English<br />through <span className="grad">conversation</span>
          </h1>
          <p className="hero-sub reveal reveal-delay-2">
            Practice speaking with Aria, an AI tutor that listens, responds, and gently
            corrects your English — all through natural voice, in real time.
          </p>
          <div className="hero-actions reveal reveal-delay-3">
            <Link to="/app" className="btn-hero btn-hero-primary">
              Start Practicing <Arrow />
            </Link>
            <a href="#how" className="btn-hero btn-hero-ghost">See how it works</a>
          </div>
          <div className="hero-visual reveal reveal-delay-4">
            <div className="hero-mockup">
              <div className="mock-bar"><div className="mock-dot" /><div className="mock-dot" /><div className="mock-dot" /></div>
              <div className="mock-wave" ref={waveRef} />
              <div className="mock-status"><span className="mock-status-dot" /> Connected — speak now!</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how" id="how">
        <div className="wrap">
          <div className="section-label reveal">How it works</div>
          <h2 className="section-title reveal reveal-delay-1">Three steps to fluency</h2>
          <p className="section-sub reveal reveal-delay-2">
            No installations, no accounts. Open the app, allow your microphone, and start improving your English immediately.
          </p>
          <div className="steps">
            <div className="step reveal reveal-delay-1">
              <div className="step-num">1</div>
              <h3>Choose your mode</h3>
              <p>Pick <strong>Free Talk</strong> for open conversation on any topic, or <strong>Word Pitch</strong> to practice describing a random word and build vocabulary.</p>
            </div>
            <div className="step reveal reveal-delay-2">
              <div className="step-num">2</div>
              <h3>Start speaking</h3>
              <p>Just talk naturally. Aria understands your speech in real time — no typing, no buttons to hold. Speak as you would with a real tutor.</p>
            </div>
            <div className="step reveal reveal-delay-3">
              <div className="step-num">3</div>
              <h3>Get instant feedback</h3>
              <p>Aria responds with corrections, better phrasing, and encouragement — all spoken aloud so you stay immersed in the conversation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="glow glow-f" />
        <div className="wrap">
          <div className="section-label reveal">Practice modes</div>
          <h2 className="section-title reveal reveal-delay-1">Two ways to improve</h2>
          <p className="section-sub reveal reveal-delay-2">
            Whether you want free-form conversation or structured vocabulary practice, Aria adapts to your goals.
          </p>
          <div className="feat-grid">
            <div className="feat-card reveal reveal-delay-1">
              <div className="feat-icon fi-talk">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <line x1="9" y1="10" x2="9" y2="10" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="12" y1="10" x2="12" y2="10" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="15" y1="10" x2="15" y2="10" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="feat-tag">Conversation</div>
              <h3>Free Talk</h3>
              <p>Have a natural conversation about anything — your day, your interests, current events. Aria keeps the dialogue flowing while helping you improve.</p>
              <ul className="feat-list">
                <li><Check /> Real-time grammar corrections</li>
                <li><Check /> Better phrasing suggestions</li>
                <li><Check /> Adapts to your proficiency level</li>
              </ul>
            </div>
            <div className="feat-card reveal reveal-delay-2">
              <div className="feat-icon fi-pitch">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <div className="feat-tag">Vocabulary</div>
              <h3>Word Pitch</h3>
              <p>Get a random word and describe it to Aria. She'll teach you synonyms, collocations, and richer expressions — building your vocabulary through practice.</p>
              <ul className="feat-list">
                <li><Check /> 70+ words across 10 categories</li>
                <li><Check /> Synonyms &amp; collocations taught in context</li>
                <li><Check /> Guided follow-up questions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech */}
      <section className="tech" id="tech">
        <div className="wrap">
          <div className="section-label reveal">Under the hood</div>
          <h2 className="section-title reveal reveal-delay-1">Built on cutting-edge tech</h2>
          <p className="section-sub reveal reveal-delay-2">
            No separate speech-to-text or text-to-speech. Gemini's native audio model handles everything end-to-end for ultra-low latency.
          </p>
          <div className="tech-grid">
            <div className="tech-card reveal reveal-delay-1">
              <div className="tech-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" /><path d="M19 11a7 7 0 0 1-14 0" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
              </div>
              <h4>Native Audio AI</h4>
              <p>Gemini 2.5 Flash processes speech directly — no transcription step</p>
            </div>
            <div className="tech-card reveal reveal-delay-2">
              <div className="tech-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              </div>
              <h4>Real-Time Streaming</h4>
              <p>WebSocket audio streaming for instant bi-directional conversation</p>
            </div>
            <div className="tech-card reveal reveal-delay-3">
              <div className="tech-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h4>Barge-In Support</h4>
              <p>Interrupt Aria mid-sentence, just like a real conversation</p>
            </div>
            <div className="tech-card reveal reveal-delay-4">
              <div className="tech-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
              </div>
              <h4>Works in Browser</h4>
              <p>No downloads, no installs — open and start talking immediately</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="wrap">
          <div className="cta-box reveal">
            <div className="glow glow-c1" />
            <div className="glow glow-c2" />
            <h2>Ready to practice?</h2>
            <p>Your AI English tutor is waiting. No sign-up, no credit card — just open the app and start speaking.</p>
            <Link to="/app" className="btn-hero btn-hero-primary">
              Launch Aria <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="wrap">
          <div className="footer-inner">
            <div className="footer-brand">Aria — AI English Tutor</div>
            <div className="footer-note">Powered by Google Gemini 2.5 Native Audio</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
