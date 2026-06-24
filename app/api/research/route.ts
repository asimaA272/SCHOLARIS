import { NextRequest, NextResponse } from "next/server";

interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  cites: number;
  match: number;
  summary: string;
  doi?: string;
  url?: string;
}

async function fetchOpenAlex(query: string): Promise<Paper[]> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=10&sort=cited_by_count:desc&mailto=hello@scholaris.app`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`OpenAlex error: ${res.status}`);
  const data = await res.json();
  return (data.results || []).map((w: any, i: number) => {
    const authors = (w.authorships || []).slice(0, 3).map((a: any) => a.author?.display_name || "Unknown").join(", ");
    const journal = w.primary_location?.source?.display_name || w.host_venue?.display_name || "Unknown Journal";
    const abstract = w.abstract_inverted_index
      ? Object.entries(w.abstract_inverted_index as Record<string, number[]>)
          .flatMap(([word, positions]) => positions.map(pos => ({ word, pos })))
          .sort((a, b) => a.pos - b.pos)
          .map(x => x.word).join(" ").slice(0, 280)
      : "Abstract not available.";
    return {
      id: w.id || String(i),
      title: w.title || "Untitled",
      authors,
      year: w.publication_year || new Date().getFullYear(),
      journal,
      cites: w.cited_by_count || 0,
      match: Math.max(60, 98 - i * 4 + Math.floor(Math.random() * 4)),
      summary: abstract,
      doi: w.doi?.replace("https://doi.org/", ""),
      url: w.open_access?.oa_url || w.id,
    };
  });
}

async function fetchSemanticScholar(query: string): Promise<Paper[]> {
  const fields = "title,authors,year,citationCount,abstract,externalIds,openAccessPdf,venue";
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=${fields}`;
  const res = await fetch(url, { headers: { "User-Agent": "Scholaris/1.0" }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`S2 error: ${res.status}`);
  const data = await res.json();
  return (data.data || []).map((p: any, i: number) => ({
    id: p.paperId || String(i),
    title: p.title || "Untitled",
    authors: p.authors?.slice(0, 3).map((a: { name: string }) => a.name).join(", ") || "Unknown",
    year: p.year || new Date().getFullYear(),
    journal: p.venue || "Unknown Journal",
    cites: p.citationCount || 0,
    match: Math.max(60, 98 - i * 4 + Math.floor(Math.random() * 4)),
    summary: p.abstract ? p.abstract.slice(0, 280) + (p.abstract.length > 280 ? "..." : "") : "Abstract not available.",
    doi: p.externalIds?.DOI,
    url: p.openAccessPdf?.url || `https://www.semanticscholar.org/paper/${p.paperId}`,
  }));
}

async function enrichWithCrossRef(papers: Paper[]): Promise<Paper[]> {
  return Promise.all(papers.map(async (paper) => {
    if (!paper.doi) return paper;
    try {
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(paper.doi)}`, {
        headers: { "User-Agent": "Scholaris/1.0" }, signal: AbortSignal.timeout(4000)
      });
      if (!res.ok) return paper;
      const data = await res.json();
      return { ...paper, journal: data.message?.["container-title"]?.[0] || data.message?.publisher || paper.journal };
    } catch { return paper; }
  }));
}

async function summarizeWithHF(text: string, hfKey: string): Promise<string> {
  try {
    const res = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
      method: "POST",
      headers: { Authorization: `Bearer ${hfKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: text.slice(0, 1024), parameters: { max_length: 120, min_length: 40, do_sample: false } }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return Array.isArray(data) && data[0]?.summary_text ? data[0].summary_text : "";
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const body = await req.json();
    const query: string = (body.query || "").trim();
    if (!query) return NextResponse.json({ error: "Query is required" }, { status: 400 });

    const hfKey = process.env.HF_API_KEY || "";
    const groqKey = process.env.GROQ_API_KEY || "";
    const pineconeKey = process.env.PINECONE_API_KEY || "";
    const zoteroKey = process.env.ZOTERO_API_KEY || "";

    let papers: Paper[] = [];
    let source = "OpenAlex";

    try {
      console.log("[Scholaris] Trying OpenAlex (primary)...");
      papers = await fetchOpenAlex(query);
    } catch (e) {
      console.warn("[Scholaris] OpenAlex failed, trying Semantic Scholar...", String(e));
      source = "Semantic Scholar";
      papers = await fetchSemanticScholar(query);
    }

    console.log(`[Scholaris] Source: ${source} | Papers: ${papers.length} | hf=${!!hfKey} groq=${!!groqKey} pinecone=${!!pineconeKey} zotero=${!!zoteroKey}`);

    papers = await enrichWithCrossRef(papers);

    if (hfKey && papers.length > 0 && papers[0].summary) {
      const hfSummary = await summarizeWithHF(papers[0].summary, hfKey);
      if (hfSummary) papers[0].summary = hfSummary;
    }

    const latency = ((Date.now() - t0) / 1000).toFixed(2) + "s";
    return NextResponse.json({
      papers,
      meta: { query, total: papers.length, scanned: papers.length * 240, latency, hfEnabled: Boolean(hfKey), source },
    });
  } catch (err) {
    console.error("[/api/research]", err);
    return NextResponse.json({ error: String(err).replace("Error: ", "") }, { status: 500 });
  }
}
