import { McpUseProvider, useWidget } from "mcp-use/react";
import React, { useState, useEffect, useRef } from "react";
import "../styles.css";
import { propSchema, type PageBuilderProps } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Landing page builder with agentic feedback loops — refine, analyze, and auto-fix via AI",
  props: propSchema,
  exposeAsTool: false,
  metadata: { prefersBorder: true, invoking: "Designing your page...", invoked: "Page ready" },
};

import type { WidgetMetadata } from "mcp-use/react";

const TONE_LABELS = ["Corporate", "Professional", "Friendly", "Casual", "Playful"];
const FONT_OPTIONS = [
  { label: "System Default", value: "system-ui, -apple-system, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Helvetica", value: "Helvetica Neue, Helvetica, sans-serif" },
  { label: "Times", value: "Times New Roman, serif" },
  { label: "Trebuchet", value: "Trebuchet MS, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION RENDERER — with reorder + inline refine
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionRenderer({ section, heroImageUrl, highlighted, onMoveUp, onMoveDown, isFirst, isLast, onRefine }: {
  section: any; heroImageUrl?: string | null; highlighted: boolean;
  onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean;
  onRefine: (instruction: string) => void;
}) {
  const [showRefine, setShowRefine] = useState(false);
  const [refineText, setRefineText] = useState("");
  const py = parseInt(section.paddingY) || 48;
  const br = section.borderRadius || "8px";
  const font = section.fontFamily || "system-ui, -apple-system, sans-serif";
  const bg = section.bgColor || "#ffffff";
  const fg = section.textColor || "#1a1a1a";
  const accent = section.accentColor || "#3b82f6";

  const wrap: React.CSSProperties = {
    backgroundColor: bg, color: fg, padding: `${py}px 32px`, fontFamily: font,
    transition: "all 0.35s ease", position: "relative",
    outline: highlighted ? "3px solid #3b82f6" : "3px solid transparent", outlineOffset: "-3px",
  };

  const toolbar = (
    <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 3, zIndex: 5 }}>
      <button onClick={() => setShowRefine(!showRefine)} title="Refine with AI"
        style={{ padding: "3px 8px", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 4, background: showRefine ? "#3b82f6" : "rgba(255,255,255,0.9)", color: showRefine ? "#fff" : "#333", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>
        ✨ Refine
      </button>
      {!isFirst && <button onClick={onMoveUp} style={arrowBtnStyle} title="Move up">↑</button>}
      {!isLast && <button onClick={onMoveDown} style={arrowBtnStyle} title="Move down">↓</button>}
    </div>
  );

  const refineBar = showRefine ? (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(59,130,246,0.95)", padding: "8px 12px", display: "flex", gap: 6, zIndex: 5 }}>
      <input value={refineText} onChange={e => setRefineText(e.target.value)} placeholder={`e.g. "more playful", "add urgency", "shorter"...`}
        onKeyDown={e => { if (e.key === "Enter" && refineText.trim()) { onRefine(refineText); setRefineText(""); setShowRefine(false); } }}
        style={{ flex: 1, padding: "6px 10px", borderRadius: 4, border: "none", fontSize: 12, outline: "none" }} />
      <button onClick={() => { if (refineText.trim()) { onRefine(refineText); setRefineText(""); setShowRefine(false); } }}
        style={{ padding: "6px 14px", background: "#fff", color: "#3b82f6", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
        ⚡ Apply
      </button>
    </div>
  ) : null;

  const btnStyle: React.CSSProperties = {
    padding: "14px 36px", borderRadius: br, border: "none", backgroundColor: accent,
    color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: font,
  };

  switch (section.type) {
    case "hero":
      return (
        <section style={wrap}>{toolbar}{refineBar}
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            {heroImageUrl && <img src={heroImageUrl} alt="Hero" style={{ width: "100%", maxHeight: 340, objectFit: "cover", borderRadius: br, marginBottom: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} />}
            <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 14, lineHeight: 1.08, fontFamily: font }}>{section.heading}</h1>
            {section.subheading && <p style={{ fontSize: 19, opacity: 0.75, marginBottom: 32, lineHeight: 1.6, maxWidth: 560, margin: "0 auto 32px", fontFamily: font }}>{section.subheading}</p>}
            {section.buttonText && <button style={btnStyle}>{section.buttonText}</button>}
          </div>
        </section>);
    case "features":
      return (
        <section style={wrap}>{toolbar}{refineBar}
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: "center", marginBottom: 48, fontFamily: font }}>{section.heading}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32 }}>
              {(section.features || []).map((f: any, i: number) => (
                <div key={i} style={{ textAlign: "center", padding: 20, borderRadius: br, background: "rgba(128,128,128,0.06)" }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>{f.icon || "✨"}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, fontFamily: font }}>{f.title}</h3>
                  <p style={{ fontSize: 14, opacity: 0.65, lineHeight: 1.6, fontFamily: font }}>{f.description}</p>
                </div>))}
            </div>
          </div>
        </section>);
    case "testimonial":
      return (
        <section style={wrap}>{toolbar}{refineBar}
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 12, opacity: 0.2 }}>&ldquo;</div>
            <blockquote style={{ fontSize: 24, fontStyle: "italic", lineHeight: 1.7, marginBottom: 20, fontFamily: font }}>{section.heading}</blockquote>
            {section.subheading && <p style={{ fontWeight: 700, fontSize: 15, fontFamily: font }}>{section.subheading}</p>}
            {section.bodyText && <p style={{ fontSize: 13, opacity: 0.5, fontFamily: font }}>{section.bodyText}</p>}
          </div>
        </section>);
    case "cta":
      return (
        <section style={wrap}>{toolbar}{refineBar}
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 14, fontFamily: font }}>{section.heading}</h2>
            {section.subheading && <p style={{ fontSize: 17, opacity: 0.75, marginBottom: 28, lineHeight: 1.6, fontFamily: font }}>{section.subheading}</p>}
            {section.buttonText && <button style={{ ...btnStyle, padding: "16px 44px", fontSize: 18 }}>{section.buttonText}</button>}
          </div>
        </section>);
    case "footer":
      return <footer style={{ ...wrap, padding: "20px 32px", textAlign: "center", fontSize: 13, opacity: 0.5 }}>{toolbar}{refineBar}{section.heading}</footer>;
    default:
      return <section style={wrap}>{toolbar}<p>{section.heading}</p></section>;
  }
}

const arrowBtnStyle: React.CSSProperties = {
  width: 24, height: 24, border: "1px solid rgba(0,0,0,0.15)", borderRadius: 4,
  background: "rgba(255,255,255,0.9)", cursor: "pointer", fontSize: 11,
  display: "flex", alignItems: "center", justifyContent: "center",
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROLS (color, font, spacing, radius, tone, text, layout)
   ═══════════════════════════════════════════════════════════════════════════ */

function ColorPicker({ control, val, apply }: { control: any; val: string; apply: (v: string) => void }) {
  const suggested = control.options?.length ? control.options : null;
  return (
    <div>
      {suggested && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
          {suggested.map((c: string) => (
            <button key={c} onClick={() => apply(c)} style={{ width: 26, height: 26, borderRadius: "50%", border: val === c ? "3px solid #000" : "2px solid #e5e7eb", backgroundColor: c, cursor: "pointer" }} />
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input type="color" value={val || "#000"} onChange={e => apply(e.target.value)} style={{ width: 32, height: 24, border: "1px solid #e5e7eb", borderRadius: 4, cursor: "pointer", padding: 0 }} />
        <span style={{ fontSize: 10, fontFamily: "monospace", color: "#6b7280" }}>{val}</span>
      </div>
    </div>
  );
}

function FontPicker({ val, apply }: { val: string; apply: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {FONT_OPTIONS.map(f => (
        <button key={f.value} onClick={() => apply(f.value)} style={{
          padding: "5px 8px", borderRadius: 5, border: val === f.value ? "2px solid #2563eb" : "1px solid #e5e7eb",
          background: val === f.value ? "#eff6ff" : "#fff", cursor: "pointer", textAlign: "left",
          fontFamily: f.value, fontSize: 11, color: val === f.value ? "#1d4ed8" : "#374151",
        }}>{f.label}</button>
      ))}
    </div>
  );
}

function SpacingSlider({ val, apply }: { val: string; apply: (v: string) => void }) {
  const num = parseInt(val) || 48;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="range" min={16} max={96} value={num} onChange={e => apply(`${e.target.value}px`)} style={{ flex: 1 }} />
      <span style={{ fontSize: 10, color: "#6b7280" }}>{num}px</span>
    </div>
  );
}

function BorderRadius({ val, apply }: { val: string; apply: (v: string) => void }) {
  const num = parseInt(val) || 8;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="range" min={0} max={24} value={num} onChange={e => apply(`${e.target.value}px`)} style={{ flex: 1 }} />
      <div style={{ width: 24, height: 24, border: "2px solid #6b7280", borderRadius: `${num}px` }} />
      <span style={{ fontSize: 10, color: "#6b7280" }}>{num}px</span>
    </div>
  );
}

function ToneSlider({ control, onApply }: { control: any; onApply: (sectionId: string, tone: string) => void }) {
  const [val, setVal] = useState(parseInt(control.currentValue) || 2);
  const [pending, setPending] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9ca3af", marginBottom: 3 }}>
        {TONE_LABELS.map((t, i) => (
          <span key={t} style={{ fontWeight: i === val ? 700 : 400, color: i === val ? "#2563eb" : "#9ca3af" }}>{t}</span>
        ))}
      </div>
      <input type="range" min={0} max={4} value={val} onChange={e => setVal(parseInt(e.target.value))} style={{ width: "100%" }} />
      <button disabled={pending} onClick={() => { setPending(true); onApply(control.targetSectionId, TONE_LABELS[val]); setTimeout(() => setPending(false), 3000); }}
        style={{ marginTop: 4, padding: "5px 12px", fontSize: 10, backgroundColor: pending ? "#9ca3af" : "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: pending ? "wait" : "pointer", fontWeight: 600, width: "100%" }}>
        {pending ? "⏳ AI is rewriting..." : `⚡ Rewrite as "${TONE_LABELS[val]}"`}
      </button>
    </div>
  );
}

function LayoutToggle({ control, val, apply }: { control: any; val: string; apply: (v: string) => void }) {
  const opts = control.options?.length ? control.options : ["centered", "split-left", "split-right"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
      {opts.map((o: string) => (
        <button key={o} onClick={() => apply(o)} style={{ padding: "6px 4px", borderRadius: 5, border: val === o ? "2px solid #2563eb" : "1px solid #e5e7eb", background: val === o ? "#eff6ff" : "#fff", cursor: "pointer", fontSize: 10, textAlign: "center" }}>{o}</button>
      ))}
    </div>
  );
}

function TextEditor({ val, apply }: { val: string; apply: (v: string) => void }) {
  const [v, setV] = useState(val || "");
  return (
    <div>
      <textarea value={v} onChange={e => setV(e.target.value)} rows={2} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 5, padding: 6, fontSize: 12, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
      <button onClick={() => apply(v)} style={{ marginTop: 3, padding: "4px 12px", fontSize: 11, backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>✓ Apply</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN WIDGET — with callTool + sendFollowUpMessage for real feedback loop
   ═══════════════════════════════════════════════════════════════════════════ */

const PageBuilder: React.FC = () => {
  const {
    props, isPending, requestDisplayMode, displayMode,
    callTool, sendFollowUpMessage,
  } = useWidget<PageBuilderProps & { globalStyles?: any; _analysis?: any }>();

  const [sections, setSections] = useState<any[]>([]);
  const [controls, setControls] = useState<any[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [globalStyles, setGlobalStyles] = useState<any>({});
  const [analysis, setAnalysis] = useState<any>(null);
  const [changeCount, setChangeCount] = useState(0);
  const [hoveredControl, setHoveredControl] = useState<string | null>(null);
  const [feedbackLog, setFeedbackLog] = useState<string[]>([]);
  const [promptText, setPromptText] = useState("");
  const [promptPending, setPromptPending] = useState(false);
  const [analyzePending, setAnalyzePending] = useState(false);

  const lastPropsJson = useRef("");

  useEffect(() => {
    if (props?.sections && props?.suggestedControls) {
      const key = JSON.stringify({ name: props.businessName, len: props.sections.length, img: props.heroImageUrl ? "y" : "n", ids: props.sections.map((s: any) => s.id).join(","), a: props._analysis ? "y" : "n" });
      if (key !== lastPropsJson.current) {
        lastPropsJson.current = key;
        setSections(JSON.parse(JSON.stringify(props.sections)));
        setControls(JSON.parse(JSON.stringify(props.suggestedControls)));
        setBusinessName(props.businessName || "");
        setHeroImageUrl(props.heroImageUrl || null);
        setGlobalStyles(props.globalStyles || {});
        if (props._analysis) setAnalysis(props._analysis);
        setChangeCount(0);
      }
    }
  }, [props]);

  if (isPending || !props || sections.length === 0) {
    return (<McpUseProvider autoSize><div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontFamily: "system-ui" }}><div style={{ fontSize: 32, marginBottom: 12 }}>✨</div><div>Designing your page...</div></div></McpUseProvider>);
  }

  /* ─── Local apply (instant, no AI) ────────────────────────────────────── */

  const applyLocal = (control: any, newValue: string) => {
    setSections(prev => prev.map(s => s.id === control.targetSectionId ? { ...s, [control.targetProperty]: newValue } : s));
    setControls(prev => prev.map(c => c.id === control.id ? { ...c, currentValue: newValue } : c));
    setChangeCount(c => c + 1);
    log(`Changed ${control.targetProperty} on ${control.targetSectionId}`);
  };

  const applyGlobal = (property: string, value: string) => {
    setSections(prev => prev.map(s => ({ ...s, [property]: value })));
    setGlobalStyles((p: any) => ({ ...p, [property]: value }));
    setChangeCount(c => c + 1);
    log(`Global: ${property} → ${value}`);
  };

  const moveSection = (idx: number, dir: "up" | "down") => {
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;
    setSections(prev => { const a = [...prev]; [a[idx], a[newIdx]] = [a[newIdx], a[idx]]; return a; });
    setChangeCount(c => c + 1);
    log(`Moved section ${dir}`);
  };

  const getVal = (c: any) => {
    const s = sections.find(s => s.id === c.targetSectionId);
    return s?.[c.targetProperty] || c.currentValue || "";
  };

  const log = (msg: string) => setFeedbackLog(prev => [...prev.slice(-14), `${new Date().toLocaleTimeString().slice(0, 5)} ${msg}`]);

  /* ─── Agentic actions (call tools / send messages) ────────────────────── */

  const handleToneApply = async (sectionId: string, tone: string) => {
    log(`🤖 Calling AI: rewrite "${sectionId}" as ${tone}...`);
    try {
      await callTool("update-section", { sectionId, property: "tone", newValue: tone });
      log(`✅ "${sectionId}" rewritten as ${tone}`);
    } catch (e: any) { log(`❌ Tone failed: ${e.message}`); }
  };

  const handleRefine = async (sectionId: string, instruction: string) => {
    log(`🤖 Refining "${sectionId}": ${instruction}...`);
    try {
      await callTool("refine-section", { sectionId, instruction });
      log(`✅ "${sectionId}" refined`);
    } catch (e: any) { log(`❌ Refine failed: ${e.message}`); }
  };

  const handleAnalyze = async () => {
    setAnalyzePending(true);
    log("🔍 Calling AI to analyze page...");
    try {
      await callTool("analyze-page", {});
      log("✅ Analysis complete");
    } catch (e: any) { log(`❌ Analysis failed: ${e.message}`); }
    setAnalyzePending(false);
  };

  const handleAutoFix = async (fix: any) => {
    log(`⚡ Auto-fixing: ${fix.tool}...`);
    try {
      await callTool(fix.tool, fix.args);
      log(`✅ Fix applied`);
    } catch (e: any) { log(`❌ Fix failed: ${e.message}`); }
  };

  const handlePrompt = async () => {
    if (!promptText.trim()) return;
    setPromptPending(true);
    log(`💬 Sending: "${promptText}"`);
    try {
      await sendFollowUpMessage(promptText);
      log("✅ Message sent to agent");
    } catch (e: any) { log(`❌ Send failed: ${e.message}`); }
    setPromptText("");
    setPromptPending(false);
  };

  /* ─── Render ──────────────────────────────────────────────────────────── */

  return (
    <McpUseProvider autoSize>
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>

        {/* LEFT: Preview */}
        <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>📄 {businessName}</span>
              {changeCount > 0 && <span style={{ fontSize: 10, background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{changeCount} edit{changeCount > 1 ? "s" : ""}</span>}
            </div>
            <button onClick={() => requestDisplayMode(displayMode === "fullscreen" ? "inline" : "fullscreen")}
              style={{ padding: "4px 10px", fontSize: 11, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              {displayMode === "fullscreen" ? "↙ Exit" : "⛶ Fullscreen"}
            </button>
          </div>
          {sections.map((s, i) => (
            <SectionRenderer key={s.id} section={s} heroImageUrl={s.type === "hero" ? heroImageUrl : null}
              highlighted={hoveredControl === s.id}
              onMoveUp={() => moveSection(i, "up")} onMoveDown={() => moveSection(i, "down")}
              isFirst={i === 0} isLast={i === sections.length - 1}
              onRefine={(instruction) => handleRefine(s.id, instruction)} />
          ))}
        </div>

        {/* RIGHT: Controls */}
        <div style={{ width: 300, overflowY: "auto", borderLeft: "1px solid #e5e7eb", background: "#fafafa", padding: 12, flexShrink: 0, display: "flex", flexDirection: "column" }}>

          {/* Prompt bar (the feedback loop entry point) */}
          <div style={{ marginBottom: 12, padding: 10, background: "linear-gradient(135deg, #1e293b, #334155)", borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>💬 Tell the AI what to change</div>
            <div style={{ display: "flex", gap: 4 }}>
              <input value={promptText} onChange={e => setPromptText(e.target.value)} placeholder="e.g. 'make it warmer', 'swap hero and CTA'..."
                onKeyDown={e => { if (e.key === "Enter") handlePrompt(); }}
                disabled={promptPending}
                style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: "none", fontSize: 12, outline: "none", background: "#f8fafc" }} />
              <button onClick={handlePrompt} disabled={promptPending}
                style={{ padding: "7px 12px", background: promptPending ? "#64748b" : "#3b82f6", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: promptPending ? "wait" : "pointer", whiteSpace: "nowrap" }}>
                {promptPending ? "..." : "Send"}
              </button>
            </div>
          </div>

          {/* Analyze button */}
          <button onClick={handleAnalyze} disabled={analyzePending}
            style={{ marginBottom: 12, padding: "10px", background: analyzePending ? "#f3f4f6" : "linear-gradient(135deg, #fef2f2, #fef9c3)", border: "1px solid #fca5a5", borderRadius: 10, cursor: analyzePending ? "wait" : "pointer", fontSize: 12, fontWeight: 700, color: "#991b1b", width: "100%", textAlign: "center" }}>
            {analyzePending ? "🔍 Analyzing..." : "🔍 Analyze page — get AI suggestions"}
          </button>

          {/* Analysis results */}
          {analysis?.issues && (
            <div style={{ marginBottom: 12, padding: 10, background: "#fef2f2", borderRadius: 10, border: "1px solid #fca5a5" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", marginBottom: 6 }}>
                Score: {analysis.overallScore}/10 — {analysis.summary}
              </div>
              {analysis.issues.map((issue: any, i: number) => (
                <div key={i} style={{ padding: 6, background: "#fff", borderRadius: 5, marginBottom: 3, border: "1px solid #fecaca" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#374151" }}>{issue.severity.toUpperCase()} · {issue.sectionId}</div>
                  <div style={{ fontSize: 10, color: "#374151", margin: "2px 0" }}>{issue.issue}</div>
                  <div style={{ fontSize: 9, color: "#059669" }}>→ {issue.suggestion}</div>
                  {issue.autoFix?.tool && (
                    <button onClick={() => handleAutoFix(issue.autoFix)}
                      style={{ marginTop: 3, padding: "3px 8px", fontSize: 9, background: "#059669", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}>
                      ⚡ Auto-fix
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Global styles */}
          <div style={{ marginBottom: 12, padding: 10, background: "linear-gradient(135deg, #eff6ff, #faf5ff)", borderRadius: 10, border: "1px solid #c7d2fe" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4338ca", marginBottom: 8 }}>🌐 Global styles</div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: "#6366f1", fontWeight: 600, marginBottom: 3 }}>Font</div>
              <select value={globalStyles?.fontFamily || "system-ui, -apple-system, sans-serif"} onChange={e => applyGlobal("fontFamily", e.target.value)}
                style={{ width: "100%", padding: "5px 6px", borderRadius: 5, border: "1px solid #c7d2fe", fontSize: 11, background: "#fff" }}>
                {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "#6366f1", fontWeight: 600, marginBottom: 3 }}>Accent</div>
                <input type="color" value={globalStyles?.accentColor || "#3b82f6"} onChange={e => applyGlobal("accentColor", e.target.value)}
                  style={{ width: "100%", height: 24, border: "1px solid #c7d2fe", borderRadius: 4, cursor: "pointer", padding: 0 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "#6366f1", fontWeight: 600, marginBottom: 3 }}>Radius</div>
                <input type="range" min={0} max={24} value={parseInt(globalStyles?.borderRadius) || 8} onChange={e => applyGlobal("borderRadius", `${e.target.value}px`)} style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          {/* Per-section controls */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 6 }}>🎛️ Section controls</div>
          {controls.map(c => {
            const v = getVal(c);
            return (
              <div key={c.id} onMouseEnter={() => setHoveredControl(c.targetSectionId)} onMouseLeave={() => setHoveredControl(null)}
                style={{ background: "#fff", borderRadius: 8, padding: 10, marginBottom: 6, border: hoveredControl === c.targetSectionId ? "1px solid #93c5fd" : "1px solid #f3f4f6", transition: "all 0.2s" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 8, color: "#9ca3af", marginBottom: 6 }}>{c.targetSectionId} → {c.targetProperty}</div>
                {c.type === "color_picker" && <ColorPicker control={c} val={v} apply={x => applyLocal(c, x)} />}
                {c.type === "font_picker" && <FontPicker val={v} apply={x => applyLocal(c, x)} />}
                {c.type === "spacing_slider" && <SpacingSlider val={v} apply={x => applyLocal(c, x)} />}
                {c.type === "border_radius_slider" && <BorderRadius val={v} apply={x => applyLocal(c, x)} />}
                {c.type === "tone_slider" && <ToneSlider control={c} onApply={handleToneApply} />}
                {c.type === "layout_toggle" && <LayoutToggle control={c} val={v} apply={x => applyLocal(c, x)} />}
                {c.type === "text_editor" && <TextEditor val={v} apply={x => applyLocal(c, x)} />}
              </div>
            );
          })}

          {/* Agent activity log */}
          {feedbackLog.length > 0 && (
            <div style={{ marginTop: 8, padding: 8, background: "#f0f9ff", borderRadius: 6, border: "1px solid #bae6fd" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#0369a1", marginBottom: 3 }}>📡 Agent loop</div>
              {feedbackLog.slice(-8).map((msg, i) => (
                <div key={i} style={{ fontSize: 8, color: "#0369a1", lineHeight: 1.5, opacity: 0.4 + (i / 8) * 0.6 }}>{msg}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </McpUseProvider>
  );
};

export default PageBuilder;