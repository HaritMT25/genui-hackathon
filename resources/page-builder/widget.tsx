import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React, { useState, useEffect, useRef } from "react";
import "../styles.css";
import { propSchema, type PageBuilderProps } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description:
    "Combined landing page preview with AI-generated contextual editing controls",
  props: propSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: true,
    invoking: "Designing your page...",
    invoked: "Page ready",
  },
};

const PALETTES = [
  {
    name: "Warm",
    colors: ["#FF6B6B", "#FFA07A", "#FFD93D", "#6BCB77", "#4D96FF"],
  },
  {
    name: "Cool",
    colors: ["#4ECDC4", "#44B7D8", "#6C5CE7", "#A29BFE", "#74B9FF"],
  },
  {
    name: "Earth",
    colors: ["#8D6E63", "#A1887F", "#D7CCC8", "#4E342E", "#F5F0EB"],
  },
  {
    name: "Neon",
    colors: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"],
  },
  {
    name: "Mono",
    colors: ["#1a1a1a", "#333333", "#666666", "#999999", "#ffffff"],
  },
];

const TONE_LABELS = [
  "Corporate",
  "Professional",
  "Friendly",
  "Casual",
  "Playful",
];

const DENSITY_SCALE: Record<string, number> = {
  compact: 0.7,
  cozy: 1,
  spacious: 1.4,
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function getButtonStyle(
  accent: string,
  variant: string = "solid",
  radius: number = 8,
): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: radius,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };
  if (variant === "outline") {
    return {
      ...base,
      background: "transparent",
      color: accent,
      border: `2px solid ${accent}`,
    };
  }
  if (variant === "ghost") {
    return {
      ...base,
      background: accent + "1a",
      color: accent,
      border: "none",
    };
  }
  return { ...base, background: accent, color: "#fff", border: "none" };
}

function getInnerAlignStyle(align: string = "center"): React.CSSProperties {
  return {
    textAlign: align as any,
    marginLeft: align === "center" ? "auto" : 0,
    marginRight: align === "center" ? "auto" : 0,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION RENDERER
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionRenderer({ section }: { section: any }) {
  const densityScale = DENSITY_SCALE[section.density || "cozy"] || 1;
  const accent = section.accentColor || "#3b82f6";
  const radius = typeof section.borderRadius === "number"
    ? section.borderRadius
    : parseInt(section.borderRadius) || 8;
  const align = section.textAlign || "center";

  const style: React.CSSProperties = {
    backgroundColor: section.bgColor || "#ffffff",
    color: section.textColor || "#1a1a1a",
    padding: `${Math.round(48 * densityScale)}px ${Math.round(32 * densityScale)}px`,
    fontFamily: section.fontFamily || "system-ui, -apple-system, sans-serif",
    transition: "all 0.3s ease",
  };

  switch (section.type) {
    case "hero":
      return (
        <section style={style}>
          <div
            style={{
              maxWidth: 800,
              ...getInnerAlignStyle(align),
            }}
          >
            <h1
              style={{
                fontSize: 42,
                fontWeight: 800,
                marginBottom: 12,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {section.heading}
            </h1>
            {section.subheading && (
              <p
                style={{
                  fontSize: 18,
                  opacity: 0.8,
                  marginBottom: 28,
                  lineHeight: 1.5,
                  maxWidth: 600,
                  marginLeft: align === "center" ? "auto" : 0,
                  marginRight: align === "center" ? "auto" : 0,
                }}
              >
                {section.subheading}
              </p>
            )}
            {section.buttonText && (
              <button
                style={{
                  padding: "12px 32px",
                  fontSize: 16,
                  ...getButtonStyle(accent, section.buttonStyle, radius),
                }}
              >
                {section.buttonText}
              </button>
            )}
          </div>
        </section>
      );

    case "features":
      return (
        <section style={style}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                textAlign: align as any,
                marginBottom: 40,
              }}
            >
              {section.heading}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 32,
              }}
            >
              {(section.features || []).map((feat: any, i: number) => (
                <div
                  key={i}
                  style={{ textAlign: align as any, padding: 16 }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      marginBottom: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: accent + "1a",
                      color: accent,
                    }}
                  >
                    {feat.icon || "✨"}
                  </div>
                  <h3
                    style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}
                  >
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "testimonial":
      return (
        <section style={style}>
          <div
            style={{
              maxWidth: 700,
              ...getInnerAlignStyle(align),
            }}
          >
            <div
              style={{
                fontSize: 48,
                marginBottom: 16,
                color: accent,
                opacity: 0.5,
              }}
            >
              &ldquo;
            </div>
            <blockquote
              style={{
                fontSize: 22,
                fontStyle: "italic",
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              {section.heading}
            </blockquote>
            {section.subheading && (
              <p style={{ fontWeight: 600, fontSize: 14 }}>
                {section.subheading}
              </p>
            )}
            {section.bodyText && (
              <p style={{ fontSize: 13, opacity: 0.6 }}>{section.bodyText}</p>
            )}
          </div>
        </section>
      );

    case "cta":
      return (
        <section style={style}>
          <div
            style={{
              maxWidth: 600,
              ...getInnerAlignStyle(align),
            }}
          >
            <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 12 }}>
              {section.heading}
            </h2>
            {section.subheading && (
              <p
                style={{
                  fontSize: 16,
                  opacity: 0.8,
                  marginBottom: 24,
                  lineHeight: 1.5,
                }}
              >
                {section.subheading}
              </p>
            )}
            {section.buttonText && (
              <button
                style={{
                  padding: "14px 40px",
                  fontSize: 18,
                  fontWeight: 700,
                  ...getButtonStyle(accent, section.buttonStyle, radius),
                }}
              >
                {section.buttonText}
              </button>
            )}
          </div>
        </section>
      );

    case "footer":
      return (
        <footer
          style={{
            ...style,
            padding: `${Math.round(24 * densityScale)}px 32px`,
            textAlign: "center",
            fontSize: 13,
            opacity: 0.7,
            borderTop: section.accentColor
              ? `3px solid ${accent}`
              : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {section.heading}
        </footer>
      );

    default:
      return (
        <section style={style}>
          <p>{section.heading}</p>
        </section>
      );
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROL WIDGETS
   ═══════════════════════════════════════════════════════════════════════════ */

function ColorPickerControl({
  control,
  currentValue,
  onApply,
}: {
  control: any;
  currentValue: string;
  onApply: (v: string) => void;
}) {
  const suggested = control.options?.length ? control.options : null;

  return (
    <div>
      {suggested && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4 }}>
            Suggested
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {suggested.map((color: string) => (
              <button
                key={color}
                onClick={() => onApply(color)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border:
                    currentValue === color
                      ? "3px solid #000"
                      : "2px solid #e5e7eb",
                  backgroundColor: color,
                  cursor: "pointer",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.25)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            ))}
          </div>
        </div>
      )}
      {PALETTES.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 10, color: "#9ca3af", width: 36 }}>
            {p.name}
          </span>
          {p.colors.map((color) => (
            <button
              key={color}
              onClick={() => onApply(color)}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border:
                  currentValue === color
                    ? "2px solid #000"
                    : "1px solid #e5e7eb",
                backgroundColor: color,
                cursor: "pointer",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
          ))}
        </div>
      ))}
      <input
        type="color"
        value={currentValue || "#000000"}
        onChange={(e) => onApply(e.target.value)}
        style={{
          width: "100%",
          height: 28,
          cursor: "pointer",
          marginTop: 4,
          border: "none",
        }}
      />
    </div>
  );
}

function ToneSliderControl({
  control,
  onApply,
}: {
  control: any;
  onApply: (v: string) => void;
}) {
  const [value, setValue] = useState(2);
  const [copied, setCopied] = useState(false);
  const targetLabel =
    control.targetSectionId === "*" ? "all sections" : control.targetSectionId;
  const cmd = `Update ${targetLabel} tone to "${TONE_LABELS[value]}"`;

  return (
    <div>
      <input
        type="range"
        min={0}
        max={4}
        step={1}
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        style={{ width: "100%", accentColor: "#3b82f6" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        {TONE_LABELS.map((label, i) => (
          <span
            key={label}
            style={{
              fontSize: 9,
              color: i === value ? "#2563eb" : "#9ca3af",
              fontWeight: i === value ? 700 : 400,
            }}
          >
            {label}
          </span>
        ))}
      </div>
      <div
        style={{
          marginTop: 8,
          padding: "6px 8px",
          background: "#fef3c7",
          borderRadius: 4,
          fontSize: 10,
          color: "#92400e",
        }}
      >
        ⚡ Tone needs AI rewrite. Click to copy:
        <div
          onClick={() => {
            navigator.clipboard?.writeText(cmd);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          style={{
            fontFamily: "monospace",
            marginTop: 4,
            padding: "4px 6px",
            background: "#fde68a",
            borderRadius: 3,
            cursor: "pointer",
            wordBreak: "break-all",
          }}
        >
          {copied ? "✓ Copied!" : cmd}
        </div>
      </div>
    </div>
  );
}

function LayoutToggleControl({
  control,
  currentValue,
  onApply,
}: {
  control: any;
  currentValue: string;
  onApply: (v: string) => void;
}) {
  const options = control.options?.length
    ? control.options
    : ["centered", "split-left", "split-right", "full-bleed"];
  const icons: Record<string, string> = {
    centered: "▣",
    "split-left": "◧",
    "split-right": "◨",
    "full-bleed": "▬",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {options.map((opt: string) => (
        <button
          key={opt}
          onClick={() => onApply(opt)}
          style={{
            padding: "8px 4px",
            borderRadius: 6,
            border:
              currentValue === opt ? "2px solid #2563eb" : "1px solid #e5e7eb",
            background: currentValue === opt ? "#eff6ff" : "#ffffff",
            color: currentValue === opt ? "#1d4ed8" : "#374151",
            cursor: "pointer",
            fontSize: 11,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 20 }}>{icons[opt] || "▢"}</div>
          <div style={{ marginTop: 2 }}>{opt}</div>
        </button>
      ))}
    </div>
  );
}

function TextEditorControl({
  control,
  currentValue,
  onApply,
}: {
  control: any;
  currentValue: string;
  onApply: (v: string) => void;
}) {
  const [value, setValue] = useState(currentValue || "");

  // Keep local state in sync if currentValue changes externally
  useEffect(() => {
    setValue(currentValue || "");
  }, [currentValue]);

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        style={{
          width: "100%",
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          padding: 8,
          fontSize: 13,
          resize: "vertical",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
      <button
        onClick={() => onApply(value)}
        style={{
          marginTop: 4,
          padding: "5px 14px",
          fontSize: 12,
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        ✓ Apply
      </button>
    </div>
  );
}

/* ─── NEW CONTROLS ─────────────────────────────────────────────────────── */

function RadiusSliderControl({
  currentValue,
  onApply,
}: {
  currentValue: string;
  onApply: (v: string) => void;
}) {
  const value =
    typeof currentValue === "number"
      ? currentValue
      : parseInt(currentValue) || 8;
  return (
    <div>
      <input
        type="range"
        min={0}
        max={32}
        step={2}
        value={value}
        onChange={(e) => onApply(e.target.value)}
        style={{ width: "100%", accentColor: "#3b82f6" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: "#9ca3af",
          marginTop: 4,
        }}
      >
        <span>Sharp</span>
        <span style={{ color: "#2563eb", fontWeight: 700 }}>{value}px</span>
        <span>Pill</span>
      </div>
      {/* Live preview */}
      <div
        style={{
          marginTop: 8,
          height: 32,
          background: "#3b82f6",
          borderRadius: value,
          transition: "border-radius 0.2s",
        }}
      />
    </div>
  );
}

function DensityControl({
  currentValue,
  onApply,
}: {
  currentValue: string;
  onApply: (v: string) => void;
}) {
  const opts = [
    { id: "compact", label: "Compact" },
    { id: "cozy", label: "Cozy" },
    { id: "spacious", label: "Spacious" },
  ];
  const selected = currentValue || "cozy";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => onApply(o.id)}
          style={{
            padding: "8px 4px",
            borderRadius: 6,
            border:
              selected === o.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
            background: selected === o.id ? "#eff6ff" : "#fff",
            color: selected === o.id ? "#1d4ed8" : "#374151",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: selected === o.id ? 700 : 400,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ButtonStyleControl({
  currentValue,
  onApply,
}: {
  currentValue: string;
  onApply: (v: string) => void;
}) {
  const opts = ["solid", "outline", "ghost"];
  const selected = currentValue || "solid";
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onApply(o)}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 6,
            border:
              selected === o ? "2px solid #2563eb" : "1px solid #e5e7eb",
            background: selected === o ? "#eff6ff" : "#fff",
            color: selected === o ? "#1d4ed8" : "#374151",
            cursor: "pointer",
            fontSize: 11,
            textTransform: "capitalize",
            fontWeight: selected === o ? 700 : 400,
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function AlignmentControl({
  currentValue,
  onApply,
}: {
  currentValue: string;
  onApply: (v: string) => void;
}) {
  const opts: Array<{ id: string; icon: string; label: string }> = [
    { id: "left", icon: "⇤", label: "Left" },
    { id: "center", icon: "↔", label: "Center" },
    { id: "right", icon: "⇥", label: "Right" },
  ];
  const selected = currentValue || "center";
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => onApply(o.id)}
          title={o.label}
          style={{
            flex: 1,
            padding: "10px 0",
            border:
              selected === o.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
            background: selected === o.id ? "#eff6ff" : "#fff",
            color: selected === o.id ? "#1d4ed8" : "#374151",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}

function FontFamilyControl({
  control,
  currentValue,
  onApply,
}: {
  control: any;
  currentValue: string;
  onApply: (v: string) => void;
}) {
  const fonts = control.options?.length
    ? control.options
    : [
        { id: "system-ui, -apple-system, sans-serif", label: "System" },
        { id: "Georgia, serif", label: "Serif" },
        { id: "'Courier New', monospace", label: "Mono" },
        {
          id: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          label: "Helvetica",
        },
      ];
  return (
    <div style={{ display: "grid", gap: 4 }}>
      {fonts.map((f: any) => {
        const id = typeof f === "string" ? f : f.id;
        const label = typeof f === "string" ? f : f.label;
        const selected = currentValue === id;
        return (
          <button
            key={id}
            onClick={() => onApply(id)}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: selected ? "2px solid #2563eb" : "1px solid #e5e7eb",
              background: selected ? "#eff6ff" : "#fff",
              color: selected ? "#1d4ed8" : "#374151",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: id,
              textAlign: "left",
              fontWeight: selected ? 700 : 400,
            }}
          >
            {label} <span style={{ opacity: 0.5, fontSize: 10 }}>— Aa</span>
          </button>
        );
      })}
    </div>
  );
}

function VisibilityControl({
  currentValue,
  onApply,
}: {
  currentValue: string | boolean;
  onApply: (v: string) => void;
}) {
  // Treat anything truthy except the string "false" as visible
  const isVisible =
    currentValue === false || currentValue === "false" ? false : true;
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        onClick={() => onApply("true")}
        style={{
          flex: 1,
          padding: 8,
          borderRadius: 6,
          border: isVisible ? "2px solid #2563eb" : "1px solid #e5e7eb",
          background: isVisible ? "#eff6ff" : "#fff",
          color: isVisible ? "#1d4ed8" : "#374151",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: isVisible ? 700 : 400,
        }}
      >
        👁 Show
      </button>
      <button
        onClick={() => onApply("false")}
        style={{
          flex: 1,
          padding: 8,
          borderRadius: 6,
          border: !isVisible ? "2px solid #2563eb" : "1px solid #e5e7eb",
          background: !isVisible ? "#eff6ff" : "#fff",
          color: !isVisible ? "#1d4ed8" : "#374151",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: !isVisible ? 700 : 400,
        }}
      >
        🚫 Hide
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN WIDGET
   ═══════════════════════════════════════════════════════════════════════════ */

const PageBuilder: React.FC = () => {
  const { props, isPending, requestDisplayMode, displayMode } =
    useWidget<PageBuilderProps>();

  const [sections, setSections] = useState<any[]>([]);
  const [controls, setControls] = useState<any[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [changeCount, setChangeCount] = useState(0);

  // Only re-initialize from props when the structural identity changes,
  // so user edits aren't wiped on every prop reference change.
  const lastInitKey = useRef<string>("");

  useEffect(() => {
    if (!props?.sections || !props?.suggestedControls) return;
    const key =
      props.sections.map((s: any) => s.id).join(",") +
      "|" +
      props.suggestedControls.map((c: any) => c.id).join(",") +
      "|" +
      (props.businessName || "");
    if (key === lastInitKey.current) return;

    setSections(JSON.parse(JSON.stringify(props.sections)));
    setControls(JSON.parse(JSON.stringify(props.suggestedControls)));
    setBusinessName(props.businessName || "");
    lastInitKey.current = key;
  }, [props]);

  if (isPending || !props || sections.length === 0) {
    return (
      <McpUseProvider autoSize>
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "#9ca3af",
            fontFamily: "system-ui",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
          <div>Designing your page...</div>
        </div>
      </McpUseProvider>
    );
  }

  const handleControlChange = (control: any, newValue: string) => {
    // Dev warning if a non-global target ID doesn't exist
    if (
      control.targetSectionId !== "*" &&
      !sections.some((s) => s.id === control.targetSectionId)
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        `[PageBuilder] Control "${control.label}" targets unknown section "${control.targetSectionId}". Available IDs:`,
        sections.map((s) => s.id),
      );
    }

    setSections((prev) =>
      prev.map((s) => {
        const isTarget =
          control.targetSectionId === "*" ||
          s.id === control.targetSectionId;
        return isTarget
          ? { ...s, [control.targetProperty]: newValue }
          : s;
      }),
    );
    setControls((prev) =>
      prev.map((c) =>
        c.id === control.id ? { ...c, currentValue: newValue } : c,
      ),
    );
    setChangeCount((c) => c + 1);
  };

  const getCurrentValue = (control: any): string => {
    if (control.targetSectionId === "*") {
      // For global controls, read from the first section that has the property,
      // falling back to the control's tracked currentValue.
      const withProp = sections.find(
        (s) => s[control.targetProperty] !== undefined,
      );
      return (
        withProp?.[control.targetProperty] ?? control.currentValue ?? ""
      );
    }
    const section = sections.find((s) => s.id === control.targetSectionId);
    return section?.[control.targetProperty] ?? control.currentValue ?? "";
  };

  const isHidden = (section: any) =>
    section.visible === false || section.visible === "false";

  return (
    <McpUseProvider autoSize>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* LEFT: Page Preview */}
        <div style={{ flex: 1, overflowY: "auto", background: "#ffffff" }}>
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 16px",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(8px)",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
              >
                📄 {businessName}
              </span>
              {changeCount > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    padding: "2px 8px",
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                >
                  {changeCount} change{changeCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              onClick={() =>
                requestDisplayMode(
                  displayMode === "fullscreen" ? "inline" : "fullscreen",
                )
              }
              style={{
                padding: "4px 10px",
                fontSize: 11,
                background: "#1a1a1a",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {displayMode === "fullscreen"
                ? "↙ Exit Fullscreen"
                : "⛶ Fullscreen"}
            </button>
          </div>

          {sections
            .filter((s) => !isHidden(s))
            .map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}
        </div>

        {/* RIGHT: Control Panel */}
        <div
          style={{
            width: 290,
            overflowY: "auto",
            borderLeft: "1px solid #e5e7eb",
            background: "#fafafa",
            padding: 16,
            flexShrink: 0,
            boxSizing: "border-box",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 18 }}>🎛️</span>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Controls
              </h2>
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
              AI-generated controls for your page. Changes apply instantly.
            </p>
          </div>

          {controls.map((control) => {
            const val = getCurrentValue(control);
            const targetLabel =
              control.targetSectionId === "*"
                ? "all sections"
                : control.targetSectionId;
            return (
              <div
                key={control.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 10,
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                >
                  {control.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#9ca3af",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background:
                        control.targetSectionId === "*"
                          ? "#8b5cf6"
                          : "#10b981",
                    }}
                  />
                  {targetLabel} → {control.targetProperty}
                </div>

                {control.type === "color_picker" && (
                  <ColorPickerControl
                    control={control}
                    currentValue={val}
                    onApply={(v) => handleControlChange(control, v)}
                  />
                )}
                {control.type === "tone_slider" && (
                  <ToneSliderControl
                    control={control}
                    onApply={(v) => handleControlChange(control, v)}
                  />
                )}
                {control.type === "layout_toggle" && (
                  <LayoutToggleControl
                    control={control}
                    currentValue={val}
                    onApply={(v) => handleControlChange(control, v)}
                  />
                )}
                {control.type === "text_editor" && (
                  <TextEditorControl
                    control={control}
                    currentValue={val}
                    onApply={(v) => handleControlChange(control, v)}
                  />
                )}
                {control.type === "radius_slider" && (
                  <RadiusSliderControl
                    currentValue={val}
                    onApply={(v) => handleControlChange(control, v)}
                  />
                )}
                {control.type === "density_toggle" && (
                  <DensityControl
                    currentValue={val}
                    onApply={(v) => handleControlChange(control, v)}
                  />
                )}
                {control.type === "button_style" && (
                  <ButtonStyleControl
                    currentValue={val}
                    onApply={(v) => handleControlChange(control, v)}
                  />
                )}
                {control.type === "alignment" && (
                  <AlignmentControl
                    currentValue={val}
                    onApply={(v) => handleControlChange(control, v)}
                  />
                )}
                {control.type === "font_family" && (
                  <FontFamilyControl
                    control={control}
                    currentValue={val}
                    onApply={(v) => handleControlChange(control, v)}
                  />
                )}
                {control.type === "visibility" && (
                  <VisibilityControl
                    currentValue={val}
                    onApply={(v) => handleControlChange(control, v)}
                  />
                )}
              </div>
            );
          })}

          <div
            style={{
              marginTop: 12,
              padding: 10,
              background: "#f0fdf4",
              borderRadius: 6,
              border: "1px solid #bbf7d0",
              fontSize: 10,
              color: "#166534",
              lineHeight: 1.4,
            }}
          >
            💡 Colors, layout, and text update instantly. Tone changes need
            AI — click the command to copy, paste into chat.
          </div>
        </div>
      </div>
    </McpUseProvider>
  );
};

export default PageBuilder;