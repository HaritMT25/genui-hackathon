import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React, { useState, useEffect, useRef } from "react";
import "../styles.css";
import { propSchema, type PageBuilderProps } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Landing page preview with AI-generated controls and hero image",
  props: propSchema,
  exposeAsTool: false,
  metadata: { prefersBorder: true, invoking: "Designing your page...", invoked: "Page ready" },
};

const PALETTES = [
  { name: "Warm", colors: ["#FF6B6B", "#FFA07A", "#FFD93D", "#6BCB77", "#4D96FF"] },
  { name: "Cool", colors: ["#4ECDC4", "#44B7D8", "#6C5CE7", "#A29BFE", "#74B9FF"] },
  { name: "Earth", colors: ["#8D6E63", "#A1887F", "#D7CCC8", "#4E342E", "#F5F0EB"] },
  { name: "Neon", colors: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"] },
  { name: "Dark", colors: ["#0f172a", "#1e293b", "#334155", "#475569", "#1a1a2e"] },
  { name: "Light", colors: ["#ffffff", "#f8fafc", "#f1f5f9", "#fefce8", "#fdf2f8"] },
];
const TONE_LABELS = ["Corporate", "Professional", "Friendly", "Casual", "Playful"];
const FONT_OPTIONS = [
  { label: "System Default", value: "system-ui, -apple-system, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Helvetica", value: "Helvetica Neue, Helvetica, sans-serif" },
  { label: "Times", value: "Times New Roman, serif" },
  { label: "Courier", value: "Courier New, monospace" },
  { label: "Trebuchet", value: "Trebuchet MS, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Palatino", value: "Palatino Linotype, serif" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION RENDERER — font & borderRadius now applied to ALL child elements
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionRenderer({ section, heroImageUrl, highlighted }: { section: any; heroImageUrl?: string | null; highlighted: boolean }) {
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
  const badge = highlighted ? (
    <div style={{ position: "absolute", top: 8, left: 8, fontSize: 9, background: "#3b82f6", color: "#fff", padding: "2px 8px", borderRadius: 4, fontFamily: "system-ui", fontWeight: 600, zIndex: 5 }}>← editing</div>
  ) : null;
  const btnStyle: React.CSSProperties = {
    padding: "14px 36px", borderRadius: br, border: "none", backgroundColor: accent,
    color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: font,
    transition: "all 0.3s ease", letterSpacing: "0.02em",
  };

  switch (section.type) {
    case "hero":
      return (
        <section style={wrap} id={`section-${section.id}`}>
          {badge}
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            {heroImageUrl && (
              <img src={heroImageUrl} alt="Hero" style={{
                width: "100%", maxHeight: 340, objectFit: "cover", borderRadius: br,
                marginBottom: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }} />
            )}
            <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 14, lineHeight: 1.08, letterSpacing: "-0.03em", fontFamily: font }}>{section.heading}</h1>
            {section.subheading && (
              <p style={{ fontSize: 19, opacity: 0.75, marginBottom: 32, lineHeight: 1.6, maxWidth: 560, margin: "0 auto 32px", fontFamily: font }}>{section.subheading}</p>
            )}
            {section.buttonText && <button style={btnStyle}>{section.buttonText}</button>}
          </div>
        </section>
      );

    case "features":
      return (
        <section style={wrap} id={`section-${section.id}`}>
          {badge}
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: "center", marginBottom: 48, fontFamily: font }}>{section.heading}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32 }}>
              {(section.features || []).map((f: any, i: number) => (
                <div key={i} style={{ textAlign: "center", padding: 20, borderRadius: br, background: "rgba(128,128,128,0.06)", transition: "all 0.3s ease" }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>{f.icon || "✨"}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, fontFamily: font }}>{f.title}</h3>
                  <p style={{ fontSize: 14, opacity: 0.65, lineHeight: 1.6, fontFamily: font }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "testimonial":
      return (
        <section style={wrap} id={`section-${section.id}`}>
          {badge}
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 12, opacity: 0.2, lineHeight: 1 }}>&ldquo;</div>
            <blockquote style={{ fontSize: 24, fontStyle: "italic", lineHeight: 1.7, marginBottom: 20, fontFamily: font }}>{section.heading}</blockquote>
            {section.subheading && <p style={{ fontWeight: 700, fontSize: 15, fontFamily: font }}>{section.subheading}</p>}
            {section.bodyText && <p style={{ fontSize: 13, opacity: 0.5, fontFamily: font }}>{section.bodyText}</p>}
          </div>
        </section>
      );

    case "cta":
      return (
        <section style={wrap} id={`section-${section.id}`}>
          {badge}
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 14, fontFamily: font }}>{section.heading}</h2>
            {section.subheading && <p style={{ fontSize: 17, opacity: 0.75, marginBottom: 28, lineHeight: 1.6, fontFamily: font }}>{section.subheading}</p>}
            {section.buttonText && <button style={{ ...btnStyle, padding: "16px 44px", fontSize: 18 }}>{section.buttonText}</button>}
          </div>
        </section>
      );

    case "footer":
      return (
        <footer id={`section-${section.id}`} style={{ ...wrap, padding: "20px 32px", textAlign: "center", fontSize: 13, opacity: 0.5 }}>
          {badge}{section.heading}
        </footer>
      );

    default:
      return <section style={wrap}><p>{section.heading}</p></section>;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROLS
   ═══════════════════════════════════════════════════════════════════════════ */

function ColorPicker({ control, val, apply }: { control: any; val: string; apply: (v: string) => void }) {
  const suggested = control.options?.length ? control.options : null;
  return (
    <div>
      {suggested && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4 }}>Suggested</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {suggested.map((c: string) => (
              <button key={c} onClick={() => apply(c)} style={{ width: 30, height: 30, borderRadius: "50%", border: val === c ? "3px solid #000" : "2px solid #e5e7eb", backgroundColor: c, cursor: "pointer", transition: "transform 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.25)")} onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
            ))}
          </div>
        </div>
      )}
      {PALETTES.map(p => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: "#9ca3af", width: 32 }}>{p.name}</span>
          {p.colors.map(c => (
            <button key={c} onClick={() => apply(c)} style={{ width: 20, height: 20, borderRadius: "50%", border: val === c ? "2px solid #000" : "1px solid #e5e7eb", backgroundColor: c, cursor: "pointer", transition: "transform 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.2)")} onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
          ))}
        </div>
      ))}
      <input type="color" value={val || "#000000"} onChange={e => apply(e.target.value)} style={{ width: "100%", height: 26, cursor: "pointer", marginTop: 4, border: "none", borderRadius: 4 }} />
    </div>
  );
}

function FontPicker({ control, val, apply }: { control: any; val: string; apply: (v: string) => void }) {
  const opts = control.options?.length
    ? control.options.map((o: string) => ({ label: o.split(",")[0].trim(), value: o }))
    : FONT_OPTIONS;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {(opts as any[]).map((f: any) => {
        const fv = typeof f === "string" ? f : f.value;
        const fl = typeof f === "string" ? f.split(",")[0].trim() : f.label;
        const active = val === fv;
        return (
          <button key={fv} onClick={() => apply(fv)} style={{
            padding: "8px 10px", borderRadius: 6, textAlign: "left",
            border: active ? "2px solid #2563eb" : "1px solid #e5e7eb",
            background: active ? "#eff6ff" : "#fff", cursor: "pointer",
            fontFamily: fv, fontSize: 13, fontWeight: active ? 700 : 400,
            color: active ? "#1d4ed8" : "#374151", transition: "all 0.2s",
          }}>
            {fl}
            <span style={{ fontSize: 10, opacity: 0.5, display: "block", fontFamily: fv }}>The quick brown fox</span>
          </button>
        );
      })}
    </div>
  );
}

function SpacingSlider({ val, apply }: { val: string; apply: (v: string) => void }) {
  const n = parseInt(val) || 48;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#6b7280" }}>Spacing</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>{n}px</span>
      </div>
      <input type="range" min={16} max={120} step={4} value={n} onChange={e => apply(e.target.value + "px")} style={{ width: "100%", accentColor: "#3b82f6" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9ca3af" }}><span>Compact</span><span>Spacious</span></div>
    </div>
  );
}

function BorderRadius({ val, apply }: { val: string; apply: (v: string) => void }) {
  const n = parseInt(val) || 8;
  const presets = [0, 4, 8, 16, 24, 999];
  const labels = ["Sharp", "Subtle", "Round", "Soft", "Pill", "Full"];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#6b7280" }}>Roundness</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>{n}px</span>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {presets.map((v, i) => (
          <button key={v} onClick={() => apply(v + "px")} style={{
            flex: 1, padding: "6px 2px", fontSize: 9, borderRadius: 4, textAlign: "center",
            border: n === v ? "2px solid #2563eb" : "1px solid #e5e7eb",
            background: n === v ? "#eff6ff" : "#fff", color: n === v ? "#1d4ed8" : "#6b7280",
            cursor: "pointer", fontWeight: n === v ? 700 : 400,
          }}>
            <div style={{ width: 18, height: 12, margin: "0 auto 2px", border: "2px solid currentColor", borderRadius: Math.min(v, 7) }} />
            {labels[i]}
          </button>
        ))}
      </div>
      <input type="range" min={0} max={32} step={1} value={Math.min(n, 32)} onChange={e => apply(e.target.value + "px")} style={{ width: "100%", accentColor: "#3b82f6" }} />
    </div>
  );
}

function ToneSlider({ control }: { control: any }) {
  const [v, setV] = useState(2);
  const [copied, setCopied] = useState(false);
  const cmd = `Update section "${control.targetSectionId}" tone to "${TONE_LABELS[v]}"`;
  return (
    <div>
      <input type="range" min={0} max={4} step={1} value={v} onChange={e => setV(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#3b82f6" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {TONE_LABELS.map((l, i) => <span key={l} style={{ fontSize: 9, color: i === v ? "#2563eb" : "#9ca3af", fontWeight: i === v ? 700 : 400 }}>{l}</span>)}
      </div>
      <div onClick={() => { navigator.clipboard?.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        style={{ marginTop: 8, padding: "6px 8px", background: "#fef3c7", borderRadius: 4, fontSize: 10, color: "#92400e", cursor: "pointer" }}>
        ⚡ {copied ? "✓ Copied!" : "Click to copy AI rewrite command"}
        <div style={{ fontFamily: "monospace", marginTop: 3, fontSize: 9, opacity: 0.8, wordBreak: "break-all" }}>{cmd}</div>
      </div>
    </div>
  );
}

function LayoutToggle({ control, val, apply }: { control: any; val: string; apply: (v: string) => void }) {
  const opts = control.options?.length ? control.options : ["centered", "split-left", "split-right", "full-bleed"];
  const icons: Record<string, string> = { centered: "▣", "split-left": "◧", "split-right": "◨", "full-bleed": "▬" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {opts.map((o: string) => (
        <button key={o} onClick={() => apply(o)} style={{ padding: "8px 4px", borderRadius: 6, border: val === o ? "2px solid #2563eb" : "1px solid #e5e7eb", background: val === o ? "#eff6ff" : "#fff", color: val === o ? "#1d4ed8" : "#374151", cursor: "pointer", fontSize: 11, textAlign: "center" }}>
          <div style={{ fontSize: 20 }}>{icons[o] || "▢"}</div><div style={{ marginTop: 2 }}>{o}</div>
        </button>
      ))}
    </div>
  );
}

function TextEditor({ val, apply }: { val: string; apply: (v: string) => void }) {
  const [v, setV] = useState(val || "");
  return (
    <div>
      <textarea value={v} onChange={e => setV(e.target.value)} rows={2} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: 8, fontSize: 13, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
      <button onClick={() => apply(v)} style={{ marginTop: 4, padding: "5px 14px", fontSize: 12, backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>✓ Apply</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN WIDGET
   ═══════════════════════════════════════════════════════════════════════════ */

const PageBuilder: React.FC = () => {
  const { props, isPending, requestDisplayMode, displayMode } = useWidget<PageBuilderProps>();

  const [sections, setSections] = useState<any[]>([]);
  const [controls, setControls] = useState<any[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [changeCount, setChangeCount] = useState(0);
  const [hoveredControl, setHoveredControl] = useState<string | null>(null);

const propsLoaded = useRef(false);
const lastPropsJson = useRef("");

useEffect(() => {
    if (props?.sections && props?.suggestedControls) {
      const key = JSON.stringify({
        name: props.businessName,
        len: props.sections.length,
        img: props.heroImageUrl ? "yes" : "no",
        ids: props.sections.map((s: any) => s.id).join(","),
      });
      if (key !== lastPropsJson.current) {
        lastPropsJson.current = key;
        setSections(JSON.parse(JSON.stringify(props.sections)));
        setControls(JSON.parse(JSON.stringify(props.suggestedControls)));
        setBusinessName(props.businessName || "");
        setHeroImageUrl(props.heroImageUrl || null);
        setChangeCount(0);
      }
    }
  }, [props]);

  if (isPending || !props || sections.length === 0) {
    return (
      <McpUseProvider autoSize>
        <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontFamily: "system-ui" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div><div>Designing your page...</div>
        </div>
      </McpUseProvider>
    );
  }

  const apply = (control: any, newValue: string) => {
    setSections(prev => prev.map(s => s.id === control.targetSectionId ? { ...s, [control.targetProperty]: newValue } : s));
    setControls(prev => prev.map(c => c.id === control.id ? { ...c, currentValue: newValue } : c));
    setChangeCount(c => c + 1);
  };
  const getVal = (control: any): string => {
    const s = sections.find(s => s.id === control.targetSectionId);
    return s?.[control.targetProperty] || control.currentValue || "";
  };

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
          {sections.map(s => (
            <SectionRenderer key={s.id} section={s} heroImageUrl={s.type === "hero" ? heroImageUrl : null} highlighted={hoveredControl === s.id} />
          ))}
        </div>

        {/* RIGHT: Controls */}
        <div style={{ width: 290, overflowY: "auto", borderLeft: "1px solid #e5e7eb", background: "#fafafa", padding: 14, flexShrink: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>🎛️</span>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Controls</h2>
            </div>
            <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>AI-generated for this page. Hover to highlight target.</p>
          </div>

          {controls.map(c => {
            const v = getVal(c);
            return (
              <div key={c.id}
                onMouseEnter={() => setHoveredControl(c.targetSectionId)}
                onMouseLeave={() => setHoveredControl(null)}
                style={{
                  background: "#fff", borderRadius: 10, padding: 12, marginBottom: 8,
                  border: hoveredControl === c.targetSectionId ? "1px solid #93c5fd" : "1px solid #f3f4f6",
                  boxShadow: hoveredControl === c.targetSectionId ? "0 0 0 2px rgba(59,130,246,0.1)" : "0 1px 2px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 3 }}>{c.label}</div>
                <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#10b981" }} />
                  {c.targetSectionId} → {c.targetProperty}
                </div>
                {c.type === "color_picker" && <ColorPicker control={c} val={v} apply={x => apply(c, x)} />}
                {c.type === "font_picker" && <FontPicker control={c} val={v} apply={x => apply(c, x)} />}
                {c.type === "spacing_slider" && <SpacingSlider val={v} apply={x => apply(c, x)} />}
                {c.type === "border_radius_slider" && <BorderRadius val={v} apply={x => apply(c, x)} />}
                {c.type === "tone_slider" && <ToneSlider control={c} />}
                {c.type === "layout_toggle" && <LayoutToggle control={c} val={v} apply={x => apply(c, x)} />}
                {c.type === "text_editor" && <TextEditor val={v} apply={x => apply(c, x)} />}
              </div>
            );
          })}

          <div style={{ marginTop: 10, padding: 8, background: "#f0fdf4", borderRadius: 6, border: "1px solid #bbf7d0", fontSize: 9, color: "#166534", lineHeight: 1.5 }}>
            💡 Colors, fonts, text, spacing, and roundness update instantly. Tone changes need AI — click to copy, paste into chat.
          </div>
        </div>
      </div>
    </McpUseProvider>
  );
};

export default PageBuilder;