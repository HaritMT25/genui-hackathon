import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React, { useState } from "react";
import "../styles.css";
import { propSchema, type ControlPanelProps } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Contextual editing controls for the generated landing page",
  props: propSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: true,
    invoking: "Building controls...",
    invoked: "Controls ready",
  },
};

const PALETTES = [
  { name: "Warm", colors: ["#FF6B6B", "#FFA07A", "#FFD93D", "#6BCB77"] },
  { name: "Cool", colors: ["#4ECDC4", "#44B7D8", "#6C5CE7", "#A29BFE"] },
  { name: "Earth", colors: ["#8D6E63", "#A1887F", "#D7CCC8", "#4E342E"] },
  { name: "Neon", colors: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC"] },
  { name: "Mono", colors: ["#212121", "#616161", "#9E9E9E", "#FAFAFA"] },
];

const TONE_LABELS = ["Corporate", "Professional", "Friendly", "Casual", "Playful"];

const ControlPanel: React.FC = () => {
  const { props, isPending } = useWidget<ControlPanelProps>();
  const [appliedChanges, setAppliedChanges] = useState<Record<string, string>>({});

  if (isPending || !props) {
    return (
      <McpUseProvider autoSize>
        <div className="p-6 animate-pulse text-gray-400">
          🔧 Building your controls...
        </div>
      </McpUseProvider>
    );
  }

  // When a control is changed, we tell the user what to say
  // to trigger the update-section tool
  const handleChange = (
    controlId: string,
    sectionId: string,
    property: string,
    value: string
  ) => {
    setAppliedChanges((prev) => ({ ...prev, [controlId]: value }));
  };

  return (
    <McpUseProvider autoSize>
      <div className="p-5 space-y-4 bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🎛️</span>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Page Controls
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          These controls were generated specifically for your page.
          Adjust them and click Apply to update.
        </p>

        {props.controls.map((control) => (
          <div
            key={control.id}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-2">
              {control.label}
            </label>
            <span className="text-[10px] text-gray-400 block mb-3">
              → {control.targetSectionId}
              {control.targetProperty ? ` / ${control.targetProperty}` : ""}
            </span>

            {control.type === "color_picker" && (
              <div className="space-y-2">
                {PALETTES.map((palette) => (
                  <div key={palette.name} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 w-10">
                      {palette.name}
                    </span>
                    {palette.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          handleChange(
                            control.id,
                            control.targetSectionId,
                            control.targetProperty || "bgColor",
                            color
                          )
                        }
                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-125"
                        style={{
                          backgroundColor: color,
                          borderColor:
                            appliedChanges[control.id] === color
                              ? "#000"
                              : "transparent",
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}

            {control.type === "tone_slider" && (
              <div>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  defaultValue={2}
                  onChange={(e) =>
                    handleChange(
                      control.id,
                      control.targetSectionId,
                      "tone",
                      e.target.value
                    )
                  }
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  {TONE_LABELS.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {control.type === "layout_toggle" && (
              <div className="grid grid-cols-2 gap-2">
                {(control.options || ["centered", "split-left", "split-right", "full-bleed"]).map(
                  (opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        handleChange(
                          control.id,
                          control.targetSectionId,
                          "layout",
                          opt
                        )
                      }
                      className={`p-2 rounded border text-xs transition-all ${
                        appliedChanges[control.id] === opt
                          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {opt}
                    </button>
                  )
                )}
              </div>
            )}

            {control.type === "text_editor" && (
              <div>
                <textarea
                  className="w-full border rounded-lg p-2 text-sm resize-none dark:bg-gray-800 dark:border-gray-700"
                  rows={2}
                  defaultValue={control.currentValue || ""}
                  onChange={(e) =>
                    handleChange(
                      control.id,
                      control.targetSectionId,
                      control.targetProperty || "heading",
                      e.target.value
                    )
                  }
                />
              </div>
            )}

            {/* Apply button */}
            {appliedChanges[control.id] && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                  To apply, tell the assistant:
                </p>
                <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded block">
                  Update section "{control.targetSectionId}"{" "}
                  {control.targetProperty || control.type} to "
                  {appliedChanges[control.id]}"
                </code>
              </div>
            )}
          </div>
        ))}
      </div>
    </McpUseProvider>
  );
};

export default ControlPanel;