import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AARC – Autonomous Academic Research Collaborator",
  description:
    "AI-powered academic research assistant for students. Discover, summarize, and collaborate on research papers instantly.",
};

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #050D1F;
          --navy-2: #0A1628;
          --navy-3: #0F1F38;
          --blue-accent: #2563EB;
          --blue-bright: #3B82F6;
          --blue-glow: #60A5FA;
          --cyan: #06B6D4;
          --text-primary: #F0F6FF;
          --text-secondary: #94A8C7;
          --text-muted: #4D6A8A;
          --border: rgba(37,99,235,0.2);
          --border-bright: rgba(96,165,250,0.35);
          --card-bg: rgba(10,22,40,0.7);
        }

        body {
          font-family: 'Inter', sans-serif;
          background: var(--navy);
          color: var(--text-primary);
          overflow-x: hidden;
          line-height: 1.6;
        }

        /* NAV */
        .aarc-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 4rem;
          background: rgba(5,13,31,0.88);
          backdrop-filter: blur(16px);
          border-bottom: 0.5px solid var(--border);
        }
        .aarc-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem; font-weight: 700;
          color: var(--blue-glow); letter-spacing: -0.5px;
        }
        .aarc-logo span { color: var(--text-primary); }
        .aarc-navlinks { display: flex; gap: 2rem; list-style: none; }
        .aarc-navlinks a {
          color: var(--text-secondary); text-decoration: none;
          font-size: 0.875rem; transition: color 0.2s;
        }
        .aarc-navlinks a:hover { color: var(--text-primary); }
        .aarc-navcta {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--blue-accent); color: #fff;
          padding: 0.5rem 1.25rem; border-radius: 8px;
          font-size: 0.875rem; font-weight: 500;
          border: none; cursor: pointer; transition: all 0.2s;
          text-decoration: none;
        }
        .aarc-navcta:hover { background: var(--blue-bright); transform: translateY(-1px); }

        /* HERO */
        .aarc-hero {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          padding: 8rem 2rem 5rem;
        }
        .aarc-hero-bg { position: absolute; inset: 0; pointer-events: none; }
        .aarc-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(37,99,235,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.07) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .aarc-orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); opacity: 0.16;
        }
        .aarc-orb-1 { width: 600px; height: 600px; background: #2563EB; top: -120px; left: -120px; }
        .aarc-orb-2 { width: 420px; height: 420px; background: #06B6D4; bottom: -60px; right: -80px; }
        .aarc-orb-3 { width: 320px; height: 320px; background: #1D4ED8; top: 40%; left: 50%; transform: translateX(-50%); }

        .aarc-hero-content {
          position: relative; z-index: 2;
          max-width: 860px; text-align: center;
        }

        .aarc-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(37,99,235,0.15);
          border: 0.5px solid var(--border-bright);
          color: var(--blue-glow);
          font-size: 0.75rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 0.4rem 1rem; border-radius: 999px;
          margin-bottom: 1.75rem;
        }
        .aarc-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--cyan);
          animation: aarcPulse 2s infinite;
        }
        @keyframes aarcPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(0.75); }
        }

        .aarc-h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.2rem, 5.5vw, 3.8rem);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -1.5px; margin-bottom: 1.5rem;
        }
        .aarc-h1-plain { color: var(--text-primary); display: block; }
        .aarc-h1-grad {
          display: block;
          background: linear-gradient(135deg, var(--blue-glow) 0%, var(--cyan) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .aarc-hero-sub {
          font-size: 1.1rem; color: var(--text-secondary); line-height: 1.75;
          max-width: 580px; margin: 0 auto 2.5rem;
        }

        .aarc-btns {
          display: flex; gap: 1rem; justify-content: center;
          flex-wrap: wrap; margin-bottom: 4rem;
        }
        .aarc-btn-primary {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--blue-accent); color: #fff;
          padding: 0.9rem 2rem; border-radius: 10px;
          font-size: 1rem; font-weight: 600; cursor: pointer;
          border: none; transition: all 0.2s; text-decoration: none;
        }
        .aarc-btn-primary:hover {
          background: var(--blue-bright); transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37,99,235,0.45);
        }
        .aarc-btn-secondary {
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; color: var(--text-primary);
          padding: 0.9rem 2rem; border-radius: 10px;
          font-size: 1rem; font-weight: 500; cursor: pointer;
          border: 0.5px solid var(--border-bright); transition: all 0.2s;
          text-decoration: none;
        }
        .aarc-btn-secondary:hover { background: rgba(37,99,235,0.12); }

        .aarc-stats {
          display: flex; gap: 3rem; justify-content: center; flex-wrap: wrap;
          padding-top: 2rem; border-top: 0.5px solid var(--border);
        }
        .aarc-stat { text-align: center; }
        .aarc-stat-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.7rem; font-weight: 700; color: var(--blue-glow);
        }
        .aarc-stat-label { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem; }

        /* SECTIONS */
        .aarc-section { padding: 6rem 2rem; }
        .aarc-section-inner { max-width: 1080px; margin: 0 auto; }
        .aarc-sec-eye {
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--blue-glow); margin-bottom: 0.75rem;
        }
        .aarc-sec-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 700; letter-spacing: -0.5px;
          color: var(--text-primary); margin-bottom: 0.9rem;
        }
        .aarc-sec-sub {
          font-size: 1rem; color: var(--text-secondary);
          max-width: 520px; margin-bottom: 3.5rem; line-height: 1.7;
        }

        /* FEATURES */
        .aarc-features-bg { background: var(--navy-2); }
        .aarc-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.25rem;
        }
        .aarc-fcard {
          background: var(--card-bg);
          border: 0.5px solid var(--border);
          border-radius: 14px; padding: 1.75rem;
          transition: border-color 0.25s, transform 0.2s;
          position: relative; overflow: hidden;
        }
        .aarc-fcard::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--blue-accent), var(--cyan));
          opacity: 0; transition: opacity 0.25s;
        }
        .aarc-fcard:hover { border-color: var(--border-bright); transform: translateY(-3px); }
        .aarc-fcard:hover::before { opacity: 1; }
        .aarc-ficon {
          width: 46px; height: 46px; border-radius: 10px;
          background: rgba(37,99,235,0.15);
          border: 0.5px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.35rem; margin-bottom: 1.25rem;
        }
        .aarc-ftitle {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem; font-weight: 600;
          color: var(--text-primary); margin-bottom: 0.5rem;
        }
        .aarc-fdesc { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.65; }

        /* HOW IT WORKS */
        .aarc-steps { position: relative; display: grid; gap: 0; }
        .aarc-steps::before {
          content: ''; position: absolute;
          left: 27px; top: 0; bottom: 0; width: 1px;
          background: linear-gradient(to bottom, transparent, var(--border) 10%, var(--border) 90%, transparent);
        }
        .aarc-step {
          display: flex; gap: 2rem; align-items: flex-start;
          padding: 2rem 0; position: relative;
        }
        .aarc-stepnum {
          flex-shrink: 0; width: 54px; height: 54px;
          border-radius: 50%;
          background: var(--navy-3);
          border: 0.5px solid var(--border-bright);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.9rem; font-weight: 700;
          color: var(--blue-glow); position: relative; z-index: 1;
        }
        .aarc-stepcontent { padding-top: 0.75rem; }
        .aarc-steptitle {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.05rem; font-weight: 600;
          color: var(--text-primary); margin-bottom: 0.4rem;
        }
        .aarc-stepdesc { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.65; }
        .aarc-steptag {
          display: inline-block;
          background: rgba(6,182,212,0.1);
          border: 0.5px solid rgba(6,182,212,0.3);
          color: var(--cyan);
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 0.25rem 0.65rem; border-radius: 999px;
          margin-top: 0.75rem;
        }

        /* CTA */
        .aarc-cta-bg {
          background: var(--navy-3);
          border-top: 0.5px solid var(--border);
          border-bottom: 0.5px solid var(--border);
          text-align: center;
        }
        .aarc-cta-inner { max-width: 620px; margin: 0 auto; }
        .aarc-cta-inner h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 700; letter-spacing: -0.5px;
          color: var(--text-primary); margin-bottom: 1rem;
        }
        .aarc-cta-inner p { color: var(--text-secondary); margin-bottom: 2rem; }

        /* FOOTER */
        .aarc-footer {
          padding: 2.5rem 4rem;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1rem;
          border-top: 0.5px solid var(--border);
        }
        .aarc-footer p { font-size: 0.8rem; color: var(--text-muted); }

        @media (max-width: 640px) {
          .aarc-nav { padding: 1rem 1.5rem; }
          .aarc-navlinks { display: none; }
          .aarc-section { padding: 4rem 1.25rem; }
          .aarc-footer { padding: 2rem 1.5rem; }
        }
      `}</style>

      {/* NAV */}
      <nav className="aarc-nav">
        <div className="aarc-logo">AARC<span>.</span></div>
        <ul className="aarc-navlinks">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#start">Get Started</a></li>
          <li><a href="/research">Research App</a></li>
        </ul>
        <a className="aarc-navcta" href="/research">Get Started →</a>
      </nav>

      {/* HERO */}
      <section className="aarc-hero">
        <div className="aarc-hero-bg">
          <div className="aarc-grid" />
          <div className="aarc-orb aarc-orb-1" />
          <div className="aarc-orb aarc-orb-2" />
          <div className="aarc-orb aarc-orb-3" />
        </div>
        <div className="aarc-hero-content">
          <div className="aarc-eyebrow">
            <span className="aarc-dot" />
            AI-Powered Education Platform
          </div>
          <h1 className="aarc-h1">
            <span className="aarc-h1-plain">Your Autonomous</span>
            <span className="aarc-h1-grad">Academic Research Collaborator</span>
          </h1>
          <p className="aarc-hero-sub">
            Discover, analyze, and collaborate on academic research with the power of AI.
            From paper discovery to smart summarization — built for students who think deeper.
          </p>
          <div className="aarc-btns">
            <a className="aarc-btn-primary" href="/research">Start Researching →</a>
            <a className="aarc-btn-secondary" href="#how">See How It Works</a>
          </div>
          <div className="aarc-stats">
            <div className="aarc-stat">
              <div className="aarc-stat-num">10M+</div>
              <div className="aarc-stat-label">Research Papers</div>
            </div>
            <div className="aarc-stat">
              <div className="aarc-stat-num">50+</div>
              <div className="aarc-stat-label">Academic Domains</div>
            </div>
            <div className="aarc-stat">
              <div className="aarc-stat-num">5x</div>
              <div className="aarc-stat-label">Faster Research</div>
            </div>
            <div className="aarc-stat">
              <div className="aarc-stat-num">100%</div>
              <div className="aarc-stat-label">AI-Powered</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="aarc-section aarc-features-bg" id="features">
        <div className="aarc-section-inner">
          <div className="aarc-sec-eye">Core Features</div>
          <h2 className="aarc-sec-title">Everything you need to research smarter</h2>
          <p className="aarc-sec-sub">
            Built for students and researchers who want AI assistance without losing academic rigor.
          </p>
          <div className="aarc-features-grid">
            {[
              { icon: "🔍", title: "Intelligent Paper Discovery", desc: "Search across millions of academic papers with semantic understanding — find exactly what you need, not just keyword matches." },
              { icon: "🧠", title: "AI Research Summarization", desc: "Get instant, accurate summaries of complex academic papers. Understand key findings and conclusions in seconds." },
              { icon: "🤝", title: "Collaborative Workspace", desc: "Work with classmates in real-time. Share papers, add annotations, and build shared research libraries together." },
              { icon: "📊", title: "Citation & Reference Manager", desc: "Automatically generate citations in APA, MLA, IEEE and more. Build your reference list as you research, not after." },
              { icon: "💡", title: "Topic Gap Analysis", desc: "Identify unexplored research angles in existing literature. Let AI suggest where your contribution can make the most impact." },
              { icon: "📝", title: "Writing Assistance", desc: "From research proposals to literature reviews — get contextual writing support grounded in real academic sources." },
            ].map((f) => (
              <div className="aarc-fcard" key={f.title}>
                <div className="aarc-ficon">{f.icon}</div>
                <div className="aarc-ftitle">{f.title}</div>
                <p className="aarc-fdesc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="aarc-section" id="how">
        <div className="aarc-section-inner">
          <div className="aarc-sec-eye">How It Works</div>
          <h2 className="aarc-sec-title">From question to insight in minutes</h2>
          <p className="aarc-sec-sub">
            A streamlined research workflow designed around how students actually think.
          </p>
          <div className="aarc-steps">
            {[
              { num: "01", title: "Describe your research topic", desc: "Type your research question in plain language. AARC understands academic context and intent, helping you frame your inquiry correctly from the start.", tag: "Natural Language Input" },
              { num: "02", title: "AI discovers and ranks relevant papers", desc: "Our AI searches across PubMed, Semantic Scholar, arXiv, and more — ranking results by relevance, citation count, and recency so the best sources surface first.", tag: "Multi-Database Search" },
              { num: "03", title: "Read AI-generated summaries instantly", desc: "Each paper is automatically summarized with key findings, methodology, and limitations highlighted. Decide in 30 seconds whether a paper is worth reading in full.", tag: "Smart Summarization" },
              { num: "04", title: "Collaborate, annotate, and export", desc: "Organize research into projects, collaborate with your team, add notes, then export your bibliography or research brief — ready for your assignment or thesis.", tag: "Export & Collaborate" },
            ].map((s) => (
              <div className="aarc-step" key={s.num}>
                <div className="aarc-stepnum">{s.num}</div>
                <div className="aarc-stepcontent">
                  <div className="aarc-steptitle">{s.title}</div>
                  <p className="aarc-stepdesc">{s.desc}</p>
                  <span className="aarc-steptag">{s.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="aarc-section aarc-cta-bg" id="start">
        <div className="aarc-cta-inner">
          <h2>Ready to transform how you research?</h2>
          <p>Join students already using AARC to do deeper, faster, and smarter academic research.</p>
          <a className="aarc-btn-primary" href="/research" style={{ margin: "0 auto", display: "flex" }}>
            Start for Free →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="aarc-footer">
        <div className="aarc-logo">AARC<span>.</span></div>
        <p>© 2025 Autonomous Academic Research Collaborator. All rights reserved.</p>
      </footer>
    </>
  );
}
