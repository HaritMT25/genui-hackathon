import {
  McpUseProvider,
  useWidget,
  type WidgetMetadata,
} from "mcp-use/react";
import React, { useState } from "react";
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

/* ═══════════════════════════════════════════════════════════════════════════
   COLOR PALETTES
   ═══════════════════════════════════════════════════════════════════════════ */

const PALETTES = [
  { name: "Warm", colors: ["#FF6B6B", "#FFA07A", "#FFD93D", "#6BCB77", "#4D96FF"] },
  { name: "Cool", colors: ["#4ECDC4", "#44B7D8", "#6C5CE7", "#A29BFE", "#74B9FF"] },
  { name: "Earth", colors: ["#8D6E63", "#A1887F", "#D7CCC8", "#4E342E", "#F5F0EB"] },
  { name: "Neon", colors: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"] },
  { name: "Mono", colors: ["#1a1a1a", "#333333", "#666666", "#999999", "#ffffff"] },
];

const TONE_LABELS = ["Corporate", "Professional", "Friendly", "Casual", "Playful"];

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION RENDERER
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionRenderer({ section }: { section: any }) {
  const style: React.CSSProperties = {
    backgroundColor: section.bgColor || "#ffffff",
    color: section.textColor || "#1a1a1a",
    padding: "48px 32px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  switch (section.type) {
    case "hero":
      return (
        <section style={style}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
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
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {section.subheading}
              </p>
            )}
            {section.buttonText && (
              <button
                style={{
                  padding: "12px 32px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: section.accentColor || "#3b82f6",
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.01em",
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
                textAlign: "center",
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
                <div key={i} style={{ textAlign: "center", padding: 16 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>
                    {feat.icon || "✨"}
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
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
            style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}
          >
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>
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
            style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}
          >
            <h2
              style={{ fontSize: 30, fontWeight: 700, marginBottom: 12 }}
            >
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
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: section.accentColor || "#3b82f6",
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
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
            padding: "24px 32px",
            textAlign: "center",
            fontSize: 13,
            opacity: 0.6,
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
  onApply,
}: {
  control: any;
  onApply: (value: string) => void;
}) {
  const [selected, setSelected] = useState(control.currentValue || "");

  // Use suggested colors from the model if available, otherwise use palettes
  const suggestedColors = control.options?.length ? control.options : null;

  return (
    <div>
      {suggestedColors && (
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: 10,
              color: "#9ca3af",
              marginBottom: 4,
            }}
          >
            Suggested
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {suggestedColors.map((color: string) => (
              <button
                key={color}
                onClick={() => {
                  setSelected(color);
                  onApply(color);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border:
                    selected === color
                      ? "3px solid #000"
                      : "2px solid transparent",
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
        </div>
      )}
      {PALETTES.map((palette) => (
        <div
          key={palette.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 10, color: "#9ca3af", width: 36 }}>
            {palette.name}
          </span>
          {palette.colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                setSelected(color);
                onApply(color);
              }}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border:
                  selected === color
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
    </div>
  );
}

function ToneSliderControl({
  control,
  onApply,
}: {
  control: any;
  onApply: (value: string) => void;
}) {
  const [value, setValue] = useState(2);

  return (
    <div>
      <input
        type="range"
        min={0}
        max={4}
        step={1}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          setValue(v);
          onApply(String(v));
        }}
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
    </div>
  );
}

function LayoutToggleControl({
  control,
  onApply,
}: {
  control: any;
  onApply: (value: string) => void;
}) {
  const [selected, setSelected] = useState(control.currentValue || "");
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 6,
      }}
    >
      {options.map((opt: string) => (
        <button
          key={opt}
          onClick={() => {
            setSelected(opt);
            onApply(opt);
          }}
          style={{
            padding: "8px 4px",
            borderRadius: 6,
            border:
              selected === opt
                ? "2px solid #2563eb"
                : "1px solid #e5e7eb",
            background:
              selected === opt ? "#eff6ff" : "#ffffff",
            color: selected === opt ? "#1d4ed8" : "#374151",
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
  onApply,
}: {
  control: any;
  onApply: (value: string) => void;
}) {
  const [value, setValue] = useState(control.currentValue || "");

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
          padding: "4px 12px",
          fontSize: 11,
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Apply
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

  const [pendingUpdates, setPendingUpdates] = useState<
    { sectionId: string; property: string; value: string }[]
  >([]);

  if (isPending || !props) {
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
          <div
            style={{
              fontSize: 32,
              marginBottom: 12,
              animation: "pulse 2s infinite",
            }}
          >
            ✨
          </div>
          <div>Designing your page...</div>
        </div>
      </McpUseProvider>
    );
  }

  const handleControlApply = (
    control: any,
    newValue: string
  ) => {
    setPendingUpdates((prev) => [
      ...prev.filter(
        (u) =>
          !(
            u.sectionId === control.targetSectionId &&
            u.property === control.targetProperty
          )
      ),
      {
        sectionId: control.targetSectionId,
        property: control.targetProperty,
        value: newValue,
      },
    ]);
  };

  const getUpdateCommand = (update: {
    sectionId: string;
    property: string;
    value: string;
  }) => {
    return `Update section "${update.sectionId}" ${update.property} to "${update.value}"`;
  };

  return (
    <McpUseProvider autoSize>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ─── LEFT: Page Preview ─────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#ffffff",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 16px",
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
              }}
            >
              📄 {props.businessName}
            </span>
            <button
              onClick={() =>
                requestDisplayMode(
                  displayMode === "fullscreen" ? "inline" : "fullscreen"
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
              {displayMode === "fullscreen" ? "Exit Fullscreen" : "⛶ Fullscreen"}
            </button>
          </div>

          {/* Page sections */}
          {props.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
        </div>

        {/* ─── RIGHT: Control Panel ───────────────────────────── */}
        <div
          style={{
            width: 280,
            overflowY: "auto",
            borderLeft: "1px solid #e5e7eb",
            background: "#fafafa",
            padding: 16,
            flexShrink: 0,
          }}
        >
          {/* Header */}
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
              AI-generated controls for your page. Adjust and apply.
            </p>
          </div>

          {/* Control widgets */}
          {props.suggestedControls.map((control) => (
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
                }}
              >
                → {control.targetSectionId} / {control.targetProperty}
              </div>

              {control.type === "color_picker" && (
                <ColorPickerControl
                  control={control}
                  onApply={(val) => handleControlApply(control, val)}
                />
              )}
              {control.type === "tone_slider" && (
                <ToneSliderControl
                  control={control}
                  onApply={(val) => handleControlApply(control, val)}
                />
              )}
              {control.type === "layout_toggle" && (
                <LayoutToggleControl
                  control={control}
                  onApply={(val) => handleControlApply(control, val)}
                />
              )}
              {control.type === "text_editor" && (
                <TextEditorControl
                  control={control}
                  onApply={(val) => handleControlApply(control, val)}
                />
              )}
            </div>
          ))}

          {/* Pending updates */}
          {pendingUpdates.length > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#eff6ff",
                borderRadius: 8,
                border: "1px solid #bfdbfe",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#1e40af",
                  marginBottom: 8,
                }}
              >
                📋 Copy & paste to apply:
              </div>
              {pendingUpdates.map((update, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    background: "#dbeafe",
                    padding: "6px 8px",
                    borderRadius: 4,
                    marginBottom: 4,
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigator.clipboard?.writeText(getUpdateCommand(update));
                  }}
                  title="Click to copy"
                >
                  {getUpdateCommand(update)}
                </div>
              ))}
              <button
                onClick={() => setPendingUpdates([])}
                style={{
                  marginTop: 6,
                  padding: "3px 8px",
                  fontSize: 10,
                  background: "transparent",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </McpUseProvider>
  );
};

export default PageBuilder;
