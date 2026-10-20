"use client";

import { useState, useRef, useEffect } from "react";
import { Guide } from "@/lib/schema";

function getBarStyle(range: Guide["hands_on"] | null) {
  if (!range) return { width: '0%' };
  const max = range.max;
  let widthPercent = 0;

  if (max <= 60) widthPercent = (max / 60) * 25; 
  else if (max <= 1440) widthPercent = 25 + ((max - 60) / 1380) * 25; 
  else if (max <= 10080) widthPercent = 50 + ((max - 1440) / 8640) * 25; 
  else widthPercent = 100;
  
  return { width: `${Math.max(widthPercent, 1.5)}%` };
}

function HeaderIcon({ domain, name }: { domain: string; name: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid var(--hairline)', background: 'var(--ink)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '24px' }}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img 
      src={`https://logo.debounce.com/${domain}`} 
      alt={name} 
      style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid var(--hairline)', padding: '4px', background: '#ffffff' }}
      onError={() => setError(true)}
      suppressHydrationWarning
    />
  );
}

export default function GuideView({ guide }: { guide: Guide }) {
  const [showDownload, setShowDownload] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const guideRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDownload(false);
        setShowCopy(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shareGuide = async () => {
    const shareData = {
      title: `${guide.name} — OAuth Setup Guide`,
      text: `Here is the OAuth setup guide for ${guide.name}.`,
      url: window.location.href,
    };
    try {
      if (navigator.share && navigator.canShare(shareData)) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {}
  };

  const copyForTeam = () => {
    const text = `*OAuth Setup Forecast for ${guide.name}*\n\n` +
      `• Hands-on: ${guide.hands_on ? `${guide.hands_on.min}–${guide.hands_on.max} min` : 'Unknown'}\n` +
      `• Waiting: ${guide.waiting ? `${guide.waiting.min}–${guide.waiting.max} days` : 'None'}\n` +
      `• Difficulty: ${guide.difficulty.toUpperCase()}\n\n` +
      `Read the full guide here: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowCopy(false);
  };

  const copyForAgent = () => {
    const steps = guide.steps.map(s => `${s.id}. ${s.title}: ${s.detail}`).join('\n');
    const text = `Context for agent: Setup OAuth for ${guide.name}.\n\nSteps:\n${steps}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowCopy(false);
  };

  const downloadPDF = async () => {
    if (!guideRef.current) return;
    setIsGenerating(true);
    setShowDownload(false);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number], // FIX: TypeScript tuple
        filename: `Waypoint_${guide.name}_Guide.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css'] }
      };
      await html2pdf().set(opt).from(guideRef.current).save();
    } catch (e) {} finally { setIsGenerating(false); }
  };

  const downloadMD = () => {
    let md = `# ${guide.name} — OAuth Setup\n\n${guide.summary}\n\n`;
    md += `## Forecast\n- **Your Time:** ${guide.hands_on ? `${guide.hands_on.min}-${guide.hands_on.max} min` : 'Unknown'}\n`;
    md += `- **Waiting:** ${guide.waiting ? `${guide.waiting.min}-${guide.waiting.max} days` : 'None'}\n`;
    md += `- **Difficulty:** ${guide.difficulty.toUpperCase()}\n\n`;
    md += `## The Path\n\n`;
    guide.steps.forEach(s => { md += `### ${s.id}. ${s.title} (${s.who})\n${s.detail}\n\n`; });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.slug}-guide.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownload(false);
  };

  const ownAppText = { yes: "Yes.", probably_not: "Probably not.", depends: "It depends.", not_checked: "Not checked." }[guide.own_app?.answer || "not_checked"];

  return (
    <article ref={guideRef} style={{ paddingBottom: '40px' }}>
      <header className="guide-header">
        <div className="guide-meta-top">
          <span>Researched {guide.generated_at ? guide.generated_at.split("T")[0] : new Date().toISOString().split("T")[0]}</span>
          
          <div className="action-buttons no-print" ref={menuRef}>
            <button className="icon-btn" onClick={shareGuide} title="Share Link">
              {copied ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              )}
            </button>

            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => { setShowDownload(!showDownload); setShowCopy(false); }} title="Download">
                {isGenerating ? <span style={{fontSize: 10}}>...</span> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>}
              </button>
              {showDownload && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={downloadPDF}>Download as PDF</button>
                  <button className="dropdown-item" onClick={downloadMD}>Download as Markdown</button>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => { setShowCopy(!showCopy); setShowDownload(false); }} title="Copy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              </button>
              {showCopy && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={copyForTeam}>Copy for Team</button>
                  <button className="dropdown-item" onClick={copyForAgent}>Copy for Agent</button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
          <HeaderIcon domain={guide.domain} name={guide.name} />
          <h1 style={{ marginBottom: 0 }}>{guide.name}</h1>
        </div>
        
        <p className="subtitle" style={{ marginBottom: 0 }}>{guide.subtitle}</p>
        <p style={{ marginTop: '24px', fontSize: '17px', lineHeight: '1.6', color: 'var(--ink)' }}>{guide.summary}</p>
      </header>

      <div className="forecast-grid">
        <div className="forecast-item">
          <div className="label">Your Time</div>
          <div className="value">{guide.hands_on ? `${guide.hands_on.min}–${guide.hands_on.max} min` : "Unknown"}</div>
        </div>
        <div className="forecast-item">
          <div className="label">Waiting</div>
          <div className="value">{guide.waiting ? `${guide.waiting.min}–${guide.waiting.max} days` : "None"}</div>
        </div>
        <div className="forecast-item">
          <div className="label">Difficulty</div>
          <div className={`value ${guide.difficulty || ''}`}>{guide.difficulty || 'unknown'}</div>
        </div>
      </div>

      <p style={{ color: 'var(--muted)', marginBottom: '48px', fontSize: '15px', fontStyle: 'italic' }}>
        {guide.difficulty_reason || "No reason provided."}
      </p>

      <div className="log-graph">
        <div className="log-axis">
          <span>Minutes</span>
          <span>Hours</span>
          <span>Days</span>
          <span>Weeks</span>
        </div>
        <div className="graph-row">
          <div className="graph-label">
            <span>Hands-on effort</span>
            <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold' }}>
              {guide.hands_on ? `${guide.hands_on.min}–${guide.hands_on.max} min` : 'Unknown'}
            </span>
          </div>
          <div className="graph-track">
             <div className="graph-bar solid" style={getBarStyle(guide.hands_on)}></div>
          </div>
        </div>
        <div className="graph-row">
          <div className="graph-label">
            <span>Waiting on provider</span>
            <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold' }}>
              {guide.waiting ? `${guide.waiting.min}–${guide.waiting.max} days` : 'None'}
            </span>
          </div>
          <div className="graph-track">
             {guide.waiting ? (
               <div className="graph-bar hatched" style={getBarStyle(guide.waiting)}></div>
             ) : (
               <div className="graph-no-wait">No wait required</div>
             )}
          </div>
          <div className="graph-note">{guide.waiting_note || "None"}</div>
        </div>
      </div>

      <div className="section-block">
        <h3>Do you need your own app?</h3>
        <p style={{ fontSize: '20px', fontFamily: 'var(--font-serif)' }}>{ownAppText}</p>
        <p style={{ marginTop: '8px', color: 'var(--muted)' }}>{guide.own_app?.basis || "No basis provided."}</p>
      </div>

      <div className="section-block">
        <h3>Before you start</h3>
        {guide.start_here && (
          <p style={{ marginBottom: '16px' }}>
            Open <a href={guide.start_here.url} target="_blank" rel="noreferrer" style={{ borderBottom: '1px solid var(--hairline)' }}>{guide.start_here.label}</a>.
          </p>
        )}
        {guide.needs && guide.needs.length > 0 && (
          <ul style={{ listStyle: 'none' }}>
            {guide.needs.map((need, i) => (
              <li key={i} style={{ marginBottom: '8px', paddingLeft: '20px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--hairline)' }}>—</span> {need}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section-block">
        <h3>The Path</h3>
        <div style={{ marginTop: '32px' }}>
          {guide.steps && guide.steps.length > 0 ? guide.steps.map((step, i) => (
            <div className="step-item" key={step.id || i}>
              {i !== guide.steps.length - 1 && <div className="step-thread"></div>}
              <div className={`step-marker ${step.who || 'you'}`}></div>
              <div className="step-content">
                <div className="step-title">
                  {step.title}
                  {step.who === 'agent' && <span className="step-badge">[ Agent ]</span>}
                  {step.who === 'you' && <span className="step-badge you">[ Your turn ]</span>}
                  {step.who === 'provider' && <span className="step-badge">[ Provider ]</span>}
                </div>
                <div className="step-detail">{step.detail}</div>
              </div>
            </div>
          )) : <p style={{color: 'var(--muted)'}}>No steps recorded.</p>}
        </div>
      </div>

      {guide.watch_out && guide.watch_out.length > 0 && (
        <div className="section-block">
          <h3>Watch out for</h3>
          <ul style={{ listStyle: 'none' }}>
            {guide.watch_out.map((item, i) => (
              <li key={i} style={{ marginBottom: '16px', paddingLeft: '20px', borderLeft: '2px solid var(--hairline)' }}>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="section-block agent-split">
        <div>
          <h4>The agent can</h4>
          <ul>
            {(guide.agent_can || []).map((item, i) => <li key={i}>{item}</li>)}
            {(!guide.agent_can || guide.agent_can.length === 0) && <li style={{color: 'var(--muted)'}}>Nothing recorded.</li>}
          </ul>
        </div>
        <div>
          <h4>You'll need to</h4>
          <ul>
            {(guide.you_must || []).map((item, i) => <li key={i}>{item}</li>)}
            {(!guide.you_must || guide.you_must.length === 0) && <li style={{color: 'var(--muted)'}}>Nothing recorded.</li>}
          </ul>
        </div>
      </div>

      <div className="section-block">
        <h3>What we checked</h3>
        {(guide.claims || []).map((claim, i) => (
          <div className={`claim-item ${claim.level || 'unverified'}`} key={i}>
            <div className="claim-level">{claim.level || 'unverified'}</div>
            <p style={{ fontSize: '17px', fontWeight: 500 }}>{claim.text}</p>
            {claim.quote && <p className="claim-quote">"{claim.quote}"</p>}
          </div>
        ))}
      </div>
      
      <div className="section-block" style={{ borderTop: '1px solid var(--hairline)', paddingTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Sources</h3>
        {(guide.sources || []).map((src) => (
          <div className="source-item" key={src.id} style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '4px', fontFamily: 'var(--font-serif)', fontSize: '18px' }}>{src.title}</div>
            <a href={src.url} style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' }} target="_blank" rel="noreferrer">{src.url}</a>
            <div style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Opened {src.opened_at} · {src.kind}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'none', marginTop: '64px', paddingTop: '24px', borderTop: '1px solid var(--hairline)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textAlign: 'center' }} className="print-only">
        Generated by Waypoint on {new Date().toLocaleDateString()} · know what you're walking into.
      </div>
      
      <style jsx>{`
        @media print {
          .print-only { display: block !important; }
        }
      `}</style>
    </article>
  );
}
