import { McpUseProvider, useWidget, type WidgetMetadata } from "mcp-use/react";
import React from "react";
import "../styles.css";
import { propSchema, type LandingPageProps } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Live landing page preview",
  props: propSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: true,
    invoking: "Designing...",
    invoked: "Preview ready",
  },
};

const LandingPage: React.FC = () => {
  const { props, isPending, requestDisplayMode } =
    useWidget<LandingPageProps>();

  if (isPending || !props) {
    return (
      <McpUseProvider autoSize>
        <div className="p-8 text-center text-gray-400 animate-pulse">
          ✨ Designing your page...
        </div>
      </McpUseProvider>
    );
  }

  return (
    <McpUseProvider autoSize>
      <div className="w-full font-sans">
        {/* Fullscreen toggle */}
        <button
          onClick={() => requestDisplayMode("fullscreen")}
          className="fixed top-2 right-2 z-50 px-3 py-1 text-xs bg-black/70 text-white rounded-full hover:bg-black/90"
        >
          ⛶ Fullscreen
        </button>

        {props.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>
    </McpUseProvider>
  );
};

function SectionRenderer({ section }: { section: any }) {
  const style: React.CSSProperties = {
    backgroundColor: section.bgColor || "#ffffff",
    color: section.textColor || "#1a1a1a",
    padding: "3rem 2rem",
  };

  switch (section.type) {
    case "hero":
      return (
        <section style={style} className="text-center">
          <h1 className="text-4xl font-bold mb-3">{section.heading}</h1>
          {section.subheading && (
            <p className="text-lg opacity-80 mb-6 max-w-xl mx-auto">
              {section.subheading}
            </p>
          )}
          {section.buttonText && (
            <button
              className="px-6 py-2.5 rounded-lg font-semibold text-white"
              style={{ backgroundColor: section.accentColor || "#3b82f6" }}
            >
              {section.buttonText}
            </button>
          )}
        </section>
      );

    case "features":
      return (
        <section style={style}>
          <h2 className="text-2xl font-bold text-center mb-8">
            {section.heading}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {(section.features || []).map((f: any, i: number) => (
              <div key={i} className="text-center p-4">
                <div className="text-3xl mb-2">{f.icon || "✨"}</div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm opacity-70">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case "testimonial":
      return (
        <section style={style} className="text-center py-12">
          <blockquote className="text-xl italic max-w-2xl mx-auto mb-3">
            &ldquo;{section.heading}&rdquo;
          </blockquote>
          {section.subheading && (
            <p className="font-medium">{section.subheading}</p>
          )}
        </section>
      );

    case "cta":
      return (
        <section style={style} className="text-center">
          <h2 className="text-2xl font-bold mb-3">{section.heading}</h2>
          {section.subheading && (
            <p className="opacity-80 mb-6">{section.subheading}</p>
          )}
          {section.buttonText && (
            <button
              className="px-8 py-3 rounded-lg font-bold text-white text-lg"
              style={{ backgroundColor: section.accentColor || "#3b82f6" }}
            >
              {section.buttonText}
            </button>
          )}
        </section>
      );

    case "footer":
      return (
        <footer
          style={{ ...style, padding: "1.5rem 2rem" }}
          className="text-center text-sm opacity-60"
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

export default LandingPage;