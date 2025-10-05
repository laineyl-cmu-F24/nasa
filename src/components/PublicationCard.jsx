import { useState, useMemo } from "react";

const TOKEN_RE = /[a-z0-9\u4e00-\u9fa5]+/g;
const norm = (s) => String(s || "").toLowerCase().trim();
const tokens = (s) => (norm(s).match(TOKEN_RE) || []);
const jaccard = (a, b) => {
  const A = new Set(a), B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const uni = new Set([...A, ...B]).size || 1;
  return inter / uni;
};
const yearScore = (paper, start, end) => {
  if (!paper || !start || !end) return 0;
  if (paper >= start - 2 && paper <= end + 2) return 1;
  const d = Math.min(Math.abs(paper - start), Math.abs(paper - end));
  return Math.max(0, 1 - d / 10);
};
const missionScore = (q, m) => (!m ? 0 : norm(q).includes(norm(m)) ? 1 : 0);
const organismScore = (qOrg, arr) => {
  if (!qOrg) return 0;
  const t = (arr || []).map(norm);
  return t.includes(norm(qOrg)) ? 1 : 0;
};
const keywordScore = (qTokens, title, desc = "") =>
  jaccard(qTokens, [...tokens(title), ...tokens(desc)]);
const getYear = (y) => {
  if (!y) return undefined;
  const m = String(y).match(/\d{4}/);
  return m ? Number(m[0]) : undefined;
};
const scoreDataset = ({ qTitle, qAbs, qOrg, qYear }, d) => {
  const qText = `${qTitle || ""}. ${qAbs || ""}`;
  const qTok = tokens(qText);
  return (
    0.4 * keywordScore(qTok, d?.title || "", d?.description || "") +
    0.2 * missionScore(qText, d?.mission) +
    0.2 * organismScore(qOrg, d?.organisms) +
    0.2 * yearScore(qYear, d?.start_year, d?.end_year)
  );
};

export default function PublicationCard({ publication }) {
  const [showAbs, setShowAbs] = useState(false);
  const [showRel, setShowRel] = useState(false);
  const [loadingRel, setLoadingRel] = useState(false);
  const [datasets, setDatasets] = useState([]);

  const query = useMemo(
    () => ({
      qTitle: publication?.title || "",
      qAbs: publication?.abstract || "",
      qOrg: publication?.organism || "",
      qYear: getYear(publication?.year),
    }),
    [publication]
  );

  async function toggleRelated() {
    if (showRel) {
      setShowRel(false);
      return;
    }
    if (datasets.length > 0) {
      setShowRel(true);
      return;
    }
    setLoadingRel(true);
    try {
      const osdr = await fetch("src/data/OSDR_category.json").then((r) => r.json());
      const scored = osdr
        .map((d) => ({
          dataset_id: d.dataset_id,
          title: d.title,
          mission: d.mission,
          organisms: d.organisms,
          years: [d.start_year, d.end_year],
          access_url: d.access_url,
          score: Number(scoreDataset(query, d).toFixed(4)),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setDatasets(scored);
      setShowRel(true);
    } finally {
      setLoadingRel(false);
    }
  }

  return (
    <div className="bg-slate-700 rounded-xl p-4 shadow hover:shadow-lg transition">
      <h3 className="font-bold text-lg mb-2">{publication.title}</h3>

      <div className="mb-3 text-sm text-slate-300">
        {publication.author && publication.author !== "Unknown Author" && (
          <span className="font-medium text-slate-200">{publication.author}</span>
        )}
        {publication.year && (
          <span className="ml-2 text-slate-400">• {publication.year}</span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {publication.organism && (
          <span className="inline-flex items-center rounded-full bg-slate-600/60 text-slate-200 px-2 py-0.5 text-xs">
            {publication.organism}
          </span>
        )}
        {publication.outcome && (
          <span className="inline-flex items-center rounded-full bg-slate-600/60 text-slate-200 px-2 py-0.5 text-xs">
            {publication.outcome}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        {publication.link && (
          <a
            href={publication.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 underline text-sm hover:text-yellow-300 transition-colors"
          >
            View Full Text
          </a>
        )}
        {publication.abstract && (
          <button
            onClick={() => setShowAbs((v) => !v)}
            className="text-yellow-400 underline text-sm hover:text-yellow-300 transition-colors"
            type="button"
          >
            {showAbs ? "Hide Abstract" : "Abstract"}
          </button>
        )}
        <button
          onClick={toggleRelated}
          className="text-yellow-400 underline text-sm hover:text-yellow-300 transition-colors"
          type="button"
        >
            {showRel ? "Hide Related Datasets" : "Related Datasets"}
        </button>

        {publication.pmcid && (
          <span className="text-slate-400 text-xs">PMC{publication.pmcid}</span>
        )}
      </div>

      {loadingRel && <div className="mt-3 text-xs text-slate-300">Loading related resources…</div>}

      {showRel && (
        <div className="mt-3 bg-white/5 rounded-lg p-3 space-y-2">
          <div className="text-xs uppercase tracking-wide text-slate-300">OSDR Datasets</div>
          {datasets.length === 0 && <div className="text-xs text-slate-400">No matches</div>}
          {datasets.map((d) => (
            <a
              key={d.dataset_id}
              href={d.access_url || "#"}
              target="_blank"
              rel="noreferrer"
              className="block rounded-md p-2 hover:bg-white/10"
            >
              <div className="text-sm">{d.title}</div>
              <div className="text-[11px] text-slate-400">
                {(d.mission || "—")} · {(Array.isArray(d.organisms) ? d.organisms.join(", ") : "—")} ·{" "}
                {Array.isArray(d.years) ? d.years.filter(Boolean).join("–") : "—"}
              </div>
              <div className="text-[11px] text-emerald-300">score: {d.score}</div>
            </a>
          ))}
        </div>
      )}

      {showAbs && publication.abstract && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="text-sm text-slate-200/90 leading-relaxed">{publication.abstract}</p>
        </div>
      )}
    </div>
  );
}
