"use client";
import { useState, useRef, useCallback, useEffect } from "react";

interface Paper {
  id: string; title: string; authors: string; year: number;
  journal: string; cites: number; match: number; summary: string;
  doi?: string; url?: string;
}
interface Meta { query: string; total: number; scanned: number; latency: string; hfEnabled: boolean; }
interface HistoryEntry { id: string; query: string; date: string; paperCount: number; papers: Paper[]; meta: Meta; }
type PipelineStatus = "idle" | "running" | "done";
type Page = "research" | "library" | "reports" | "settings";
type ApiStatus = { s2: boolean | null; crossref: boolean | null };
type NavItem = { id: Page; label: string; badge: string | null };

const STEPS = [
  { label: "Query Parse", sub: "NLP intent" },
  { label: "S2 Search", sub: "Semantic Scholar" },
  { label: "CrossRef", sub: "DOI enrich" },
  { label: "Rank", sub: "Relevance sort" },
  { label: "Summarize", sub: "Abstract compress" },
  { label: "Synthesize", sub: "Report build" },
];

function lsGet(k: string) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }
function lsSet(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

async function fetchApiStatus() {
  const results = { s2: false, crossref: false };
  try { const r = await fetch("https://api.semanticscholar.org/graph/v1/paper/search?query=test&limit=1&fields=title", { signal: AbortSignal.timeout(4000) }); results.s2 = r.ok; } catch {}
  try { const r = await fetch("https://api.crossref.org/works?query=test&rows=1", { signal: AbortSignal.timeout(4000) }); results.crossref = r.ok; } catch {}
  return results;
}

function SettingsPage({ apiStatus, checkApis }: {
  apiStatus: ApiStatus;
  checkApis: () => void;
}) {
  const [local, setLocal] = useState(() => lsGet("sc_settings") || { hfApiKey: "", s2ApiKey: "", crossrefEmail: "" });
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Settings</div>
        <div style={{ fontSize: 12, color: "var(--text-faint)" }}>API keys · browser mein save hote hain</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "17px 19px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 12 }}>Live API Status</div>
          {[
            { name: "Semantic Scholar", status: apiStatus.s2 },
            { name: "CrossRef", status: apiStatus.crossref }
          ].map(({ name, status }) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border-soft)" }}>
              <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{name}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, padding: "3px 10px", borderRadius: 12,
                background: status === null ? "var(--bg-card)" : status ? "rgba(94,230,201,0.1)" : "rgba(229,112,122,0.1)",
                color: status === null ? "var(--amber)" : status ? "var(--accent)" : "var(--rose)",
                border: "1px solid " + (status === null ? "var(--border)" : status ? "var(--accent-dim)" : "var(--rose)") }}>
                {status === null ? "Checking" : status ? "Online" : "Offline"}
              </span>
            </div>
          ))}
          <button onClick={checkApis} style={{ marginTop: 12, fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-dim)", cursor: "pointer" }}>
            Refresh Status
          </button>
        </div>

        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "17px 19px" }}>
          <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>Hugging Face API Key</label>
          <input
            type="text"
            defaultValue={local.hfApiKey}
            onChange={e => setLocal((p: typeof local) => ({ ...p, hfApiKey: e.target.value }))}
            placeholder="hf_xxxxxxxxxxxxxxxx"
            style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 13, padding: "10px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", outline: "none" }}
          />
        </div>

        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "17px 19px" }}>
          <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>Semantic Scholar API Key</label>
          <input
            type="text"
            defaultValue={local.s2ApiKey}
            onChange={e => setLocal((p: typeof local) => ({ ...p, s2ApiKey: e.target.value }))}
            placeholder="xxxxxxxxxxxxxxxx"
            style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 13, padding: "10px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", outline: "none" }}
          />
        </div>

        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "17px 19px" }}>
          <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>CrossRef Email</label>
          <input
            type="email"
            defaultValue={local.crossrefEmail}
            onChange={e => setLocal((p: typeof local) => ({ ...p, crossrefEmail: e.target.value }))}
            placeholder="your@email.com"
            style={{ width: "100%", fontFamily: "var(--mono)", fontSize: 13, padding: "10px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", outline: "none" }}
          />
        </div>

        <button
          onClick={() => { lsSet("sc_settings", local); setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          style={{ fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600, padding: "11px 20px", borderRadius: "var(--r-sm)", border: "none", background: saved ? "var(--accent-dim)" : "var(--accent)", color: "#06231c", cursor: "pointer" }}>
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function SidebarContent({
  navItems,
  page,
  onPageChange,
}: {
  navItems: NavItem[];
  page: Page;
  onPageChange: (nextPage: Page) => void;
}) {
  return (
    <aside style={{ background: "var(--bg-raised)", borderRight: "1px solid var(--border)", padding: "24px 18px", display: "flex", flexDirection: "column", gap: 28, height: "100vh", overflowY: "auto", width: 252 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="var(--accent)" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5"/>
            <path d="M11 11l4 4" strokeLinecap="round"/>
            <path d="M7 4.5v5M4.5 7h5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: 16.5, fontWeight: 700 }}>Scholaris</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-faint)" }}>Research Collaborator</div>
        </div>
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(item => (
          <li key={item.id}
            onClick={() => onPageChange(item.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: "var(--r-sm)", fontSize: 13, fontWeight: 500, color: page === item.id ? "var(--accent)" : "var(--text-dim)", background: page === item.id ? "rgba(94,230,201,0.08)" : "transparent", cursor: "pointer", position: "relative" }}>
            {page === item.id && <span style={{ position: "absolute", left: -18, top: "50%", transform: "translateY(-50%)", width: 2, height: 14, background: "var(--accent)", borderRadius: 2 }} />}
            {item.label}
            {item.badge !== null && (
              <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 10, background: "var(--bg-card)", color: "var(--text-faint)", padding: "1px 6px", borderRadius: 8, border: "1px solid var(--border)" }}>
                {item.badge}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 600, fontSize: 12, color: "var(--accent)" }}>R</div>
        <div style={{ fontSize: 12 }}>
          <div style={{ fontWeight: 600 }}>Researcher</div>
          <div style={{ color: "var(--text-faint)", fontSize: 10.5 }}>Free plan</div>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [step, setStep] = useState(-1);
  const [pStatus, setPStatus] = useState<PipelineStatus>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState<Page>("research");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saved, setSaved] = useState<Paper[]>(() => (typeof window === "undefined" ? [] : lsGet("sc_saved") || []));
  const [history, setHistory] = useState<HistoryEntry[]>(() => (typeof window === "undefined" ? [] : lsGet("sc_history") || []));
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ s2: null, crossref: null });
  const inputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const checkApis = useCallback(async () => {
    setApiStatus(await fetchApiStatus());
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void checkApis();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [checkApis]);

  const toggleSave = (paper: Paper) => {
    setSaved(prev => {
      const exists = prev.some(p => p.id === paper.id);
      const updated = exists ? prev.filter(p => p.id !== paper.id) : [...prev, paper];
      lsSet("sc_saved", updated);
      return updated;
    });
  };

  const isSaved = (id: string) => saved.some(p => p.id === id);

  const copyCitations = (src: Paper[]) => {
    const text = src.map(p => p.authors + " (" + p.year + "). " + p.title + ". " + p.journal + ".").join("\n");
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand("copy"); } catch {}
    document.body.removeChild(ta);
  };

  const downloadReport = (src: Paper[], m: Meta | null) => {
    if (!src.length || !m) return;
    const txt = "SCHOLARIS REPORT\nQuery: " + m.query + "\nDate: " + new Date().toLocaleDateString() + "\n\n"
      + src.map((p, i) => "[" + (i + 1) + "] " + p.title + "\n    " + p.authors + " (" + p.year + ") - " + p.journal + "\n    " + p.summary).join("\n\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
    a.download = "scholaris-" + m.query.slice(0, 30).replace(/\s+/g, "-") + ".txt";
    a.click();
  };

  const runResearch = useCallback(async () => {
    const q = query.trim();
    if (!q) { inputRef.current?.focus(); return; }
    setLoading(true); setError(""); setPapers([]); setMeta(null);
    setPStatus("running"); setStep(0);
    const durs = [400, 800, 600, 900, 1100, 500]; let cum = 0;
    durs.forEach((d, i) => { cum += d; setTimeout(() => setStep(i + 1), cum); });
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "API error"); }
      const data = await res.json();
      const newPapers: Paper[] = data.papers || [];
      const newMeta: Meta = data.meta;
      setPapers(newPapers); setMeta(newMeta); setPStatus("done"); setStep(6);
      const entry: HistoryEntry = {
        id: Date.now().toString(), query: q,
        date: new Date().toLocaleDateString(),
        paperCount: newPapers.length, papers: newPapers, meta: newMeta
      };
      setHistory(prev => { const u = [entry, ...prev].slice(0, 20); lsSet("sc_history", u); return u; });
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (e) { setError(String(e)); setPStatus("idle"); }
    finally { setLoading(false); }
  }, [query]);

  const allOnline = apiStatus.s2 === true && apiStatus.crossref === true;
  const checking = apiStatus.s2 === null;
  const statusColor = checking ? "var(--amber)" : allOnline ? "var(--accent)" : "var(--rose)";
  const statusText = checking ? "Checking" : allOnline ? "APIs Online" : "Some APIs Down";

  const navItems: NavItem[] = [
    { id: "research", label: "Research", badge: null },
    { id: "library", label: "Library", badge: String(saved.length) },
    { id: "reports", label: "Reports", badge: history.length > 0 ? String(history.length) : null },
    { id: "settings", label: "Settings", badge: null },
  ];

  const handlePageChange = (nextPage: Page) => {
    setPage(nextPage);
    setSidebarOpen(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Mobile top bar */}
      <div className="mobile-topbar" style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 20, background: "var(--bg-raised)", borderBottom: "1px solid var(--border)", padding: "14px 18px", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16 }}>Scholaris</div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "8px 12px", color: "var(--text-dim)", cursor: "pointer", fontSize: 12 }}>
          {sidebarOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{ position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        <SidebarContent navItems={navItems} page={page} onPageChange={handlePageChange} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 25 }} />
      )}
      <div className={"sidebar-mobile" + (sidebarOpen ? " sidebar-open" : "")}>
        <SidebarContent navItems={navItems} page={page} onPageChange={handlePageChange} />
      </div>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid var(--border)", background: "rgba(10,14,20,0.7)", backdropFilter: "blur(6px)", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700 }}>
              {{ research: "Research", library: "Library", reports: "Reports", settings: "Settings" }[page]}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>Semantic Scholar · CrossRef · Hugging Face</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--mono)", fontSize: 11, padding: "6px 12px", borderRadius: 20, background: "var(--bg-card)", color: statusColor, border: "1px solid var(--border)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, animation: allOnline ? "pulse 2s infinite" : "none" }} />
            {statusText}
          </div>
        </header>

        {/* Library */}
        {page === "library" && (
          <div style={{ padding: "28px 32px" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Library</div>
              <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{saved.length} saved papers</div>
            </div>
            {saved.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-raised)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", color: "var(--text-faint)" }}>
                <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>📚</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--text-dim)", marginBottom: 8 }}>Library Khaali Hai</div>
                <div style={{ fontSize: 13 }}>Research karo aur papers pe Save click karo</div>
              </div>
            ) : (
              <>
                <button onClick={() => { setSaved([]); lsSet("sc_saved", []); }} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--rose)", background: "transparent", color: "var(--rose)", cursor: "pointer", marginBottom: 16 }}>Clear All</button>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {saved.map(paper => (
                    <div key={paper.id} style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "17px 19px" }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                        {paper.url ? <a href={paper.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text)", textDecoration: "none" }}>{paper.title}</a> : paper.title}
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", marginBottom: 8 }}>
                        {paper.authors} · {paper.year} · {paper.journal}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 12 }}>{paper.summary}</div>
                      <button onClick={() => toggleSave(paper)} style={{ fontSize: 11, fontWeight: 600, padding: "6px 11px", borderRadius: 6, border: "1px solid var(--rose)", background: "transparent", color: "var(--rose)", cursor: "pointer" }}>Remove</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Reports */}
        {page === "reports" && (
          <div style={{ padding: "28px 32px" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Reports</div>
              <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{history.length} searches</div>
            </div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-raised)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", color: "var(--text-faint)" }}>
                <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>📋</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--text-dim)", marginBottom: 8 }}>Koi Report Nahi</div>
                <div style={{ fontSize: 13 }}>Research karo — history yahan save hogi</div>
              </div>
            ) : (
              <>
                <button onClick={() => { setHistory([]); lsSet("sc_history", []); }} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--rose)", background: "transparent", color: "var(--rose)", cursor: "pointer", marginBottom: 16 }}>Clear History</button>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {history.map(entry => (
                    <div key={entry.id} style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "17px 19px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{entry.query}</div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)" }}>
                            {entry.date} · {entry.paperCount} papers · {entry.meta.latency}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                          <button onClick={() => copyCitations(entry.papers)} style={{ fontSize: 11, fontWeight: 600, padding: "6px 11px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-faint)", cursor: "pointer" }}>Copy Citations</button>
                          <button onClick={() => downloadReport(entry.papers, entry.meta)} style={{ fontSize: 11, fontWeight: 600, padding: "6px 11px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#06231c", cursor: "pointer" }}>Download</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Settings */}
        {page === "settings" && <SettingsPage apiStatus={apiStatus} checkApis={checkApis} />}

        {/* Research */}
        {page === "research" && (
          <div style={{ padding: "28px 32px 48px", flex: 1 }}>
            <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "24px 26px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>
                Multi-Agent Research Pipeline
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200, position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && runResearch()}
                    placeholder="e.g. machine learning in drug discovery"
                    style={{ width: "100%", fontFamily: "var(--sans)", fontSize: 14, padding: "12px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", outline: "none" }}
                  />
                </div>
                <button
                  onClick={runResearch}
                  disabled={loading}
                  style={{ fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: 600, padding: "12px 20px", borderRadius: "var(--r-sm)", border: "none", background: loading ? "var(--accent-dim)" : "var(--accent)", color: "#06231c", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                  {loading ? (
                    <><span style={{ width: 14, height: 14, border: "2px solid #06231c", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Running</>
                  ) : "Run Research"}
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {["climate change adaptation", "CRISPR gene editing", "transformer neural networks", "antibiotic resistance"].map(t => (
                  <button key={t} onClick={() => setQuery(t)} style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)", background: "var(--bg-card)", padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", cursor: "pointer" }}>{t}</button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(229,112,122,0.1)", border: "1px solid var(--rose)", borderRadius: "var(--r-md)", padding: "14px 18px", marginBottom: 20, color: "var(--rose)", fontSize: 13 }}>
                Error: {error}
              </div>
            )}

            {pStatus !== "idle" && (
              <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "22px 26px", marginBottom: 24 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                  Agent Pipeline
                  <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ color: pStatus === "done" ? "var(--accent)" : "var(--amber)" }}>{pStatus === "done" ? "Complete" : "Running"}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 0 }}>
                  {STEPS.map((s, i) => {
                    const done = step > i, active = step === i;
                    return (
                      <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", padding: "0 6px" }}>
                        {i < 5 && <span style={{ position: "absolute", top: 18, left: "50%", width: "100%", height: 2, background: done ? "var(--accent-dim)" : "var(--border)", zIndex: 0 }} />}
                        <div style={{ width: 36, height: 36, borderRadius: "50%", zIndex: 1, marginBottom: 9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, background: done ? "rgba(94,230,201,0.12)" : active ? "rgba(94,230,201,0.16)" : "var(--bg-card)", border: (done || active) ? "1.5px solid var(--accent)" : "1.5px solid var(--border)", color: (done || active) ? "var(--accent)" : "var(--text-faint)", animation: active ? "nodeGlow 1.4s infinite" : "none" }}>
                          {done ? "✓" : String(i + 1).padStart(2, "0")}
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: (done || active) ? "var(--accent)" : "var(--text-faint)" }}>{s.sub}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {papers.length > 0 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, textTransform: "uppercase", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 10 }}>
                    Results <span style={{ color: "var(--accent)" }}>{papers.length} papers</span>
                    <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  </div>
                  {papers.map(paper => (
                    <div key={paper.id} style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "17px 19px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 7 }}>
                        <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.4 }}>
                          {paper.url ? <a href={paper.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text)", textDecoration: "none" }}>{paper.title}</a> : paper.title}
                        </div>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 600, color: "var(--accent)", background: "rgba(94,230,201,0.08)", padding: "3px 9px", borderRadius: 6, flexShrink: 0, border: "1px solid var(--accent-dim)" }}>{paper.match}%</span>
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", marginBottom: 9, display: "flex", gap: 13, flexWrap: "wrap" }}>
                        <span>{paper.authors}</span><span>{paper.year}</span><span>{paper.journal}</span><span>{paper.cites.toLocaleString()} citations</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 13 }}>{paper.summary}</div>
                      <div style={{ display: "flex", gap: 7 }}>
                        <button onClick={() => toggleSave(paper)} style={{ fontSize: 11, fontWeight: 600, padding: "6px 11px", borderRadius: 6, cursor: "pointer", background: isSaved(paper.id) ? "rgba(94,230,201,0.08)" : "transparent", border: isSaved(paper.id) ? "1px solid var(--accent-dim)" : "1px solid var(--border)", color: isSaved(paper.id) ? "var(--accent)" : "var(--text-faint)" }}>
                          {isSaved(paper.id) ? "Saved" : "+ Save"}
                        </button>
                        {paper.url && (
                          <a href={paper.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 600, padding: "6px 11px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-faint)", textDecoration: "none" }}>Open Paper</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div ref={reportRef} style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "28px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>Synthesized Report</div>
                      <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 700 }}>{meta?.query}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => copyCitations(papers)} style={{ fontSize: 11.5, fontWeight: 600, padding: "8px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-dim)", cursor: "pointer" }}>Copy Citations</button>
                      <button onClick={() => downloadReport(papers, meta)} style={{ fontSize: 11.5, fontWeight: 600, padding: "8px 14px", borderRadius: "var(--r-sm)", border: "none", background: "var(--accent)", color: "#06231c", cursor: "pointer" }}>Download</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {papers.map((p, i) => (
                      <div key={p.id} style={{ paddingLeft: 20, borderLeft: "2px solid var(--border)", position: "relative" }}>
                        <span style={{ position: "absolute", left: -10, top: 2, fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", background: "var(--bg-raised)", padding: "0 3px" }}>{String(i + 1).padStart(2, "0")}</span>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", marginBottom: 6 }}>{p.authors} · {p.year} · {p.journal}</div>
                        <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.65 }}>{p.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {papers.length === 0 && !loading && pStatus === "idle" && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-faint)" }}>
                <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>◈</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--text-dim)", marginBottom: 8 }}>Ready to research</div>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>Enter a research topic above.</div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
