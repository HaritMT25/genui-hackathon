import { MCPServer, text, widget } from "mcp-use/server";
import { z } from "zod";

/* ─── Config ─────────────────────────────────────────────────────────────── */

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
const GROQ_BASE = "https://api.groq.com/openai/v1";
const TEXT_MODEL = "llama-3.3-70b-versatile";

/* ─── Helper: Groq JSON ──────────────────────────────────────────────────── */

async function groqJSON(systemPrompt: string, userPrompt: string): Promise<any> {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: TEXT_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errBody}`);
  }
  const data = await res.json();
  let rawText = data.choices?.[0]?.message?.content ?? "{}";
  rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(rawText);
}

/* ─── Server ─────────────────────────────────────────────────────────────── */

const server = new MCPServer({
  name: "generative-control-surfaces",
  title: "Generative Control Surfaces",
  version: "3.0.0",
  description: "AI generates landing pages with contextual controls, global styling, reordering, inline refinement, and AI feedback loops",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "favicon.ico",
  icons: [{ src: "icon.svg", mimeType: "image/svg+xml", sizes: ["512x512"] }],
});

let currentPage: any = null;

/* ─── TOOL 1: Generate landing page ──────────────────────────────────────── */

server.tool(
  {
    name: "generate-landing-page",
    description: "Generate a complete landing page with contextual editing controls.",
    schema: z.object({ description: z.string().describe("Business description") }),
    widget: { name: "page-builder", invoking: "Designing your page...", invoked: "Page ready!" },
  },
  async ({ description }) => {
    const systemPrompt = `You are an expert landing page designer. Respond with ONLY valid JSON. Shape:
{
  "businessName": "string", "tagline": "string",
  "globalStyles": { "fontFamily": "string", "accentColor": "#hex", "borderRadius": "Npx" },
  "sections": [{ "id": "string", "type": "hero|features|testimonial|cta|footer", "heading": "string", "subheading": "string", "bodyText": "string", "buttonText": "string", "features": [{"icon":"emoji","title":"string","description":"string"}], "bgColor": "#hex", "textColor": "#hex", "accentColor": "#hex", "fontFamily": "string", "borderRadius": "Npx", "paddingY": "Npx" }],
  "suggestedControls": [{ "id": "string", "type": "color_picker|tone_slider|layout_toggle|text_editor|font_picker|spacing_slider|border_radius_slider", "label": "string", "targetSectionId": "string", "targetProperty": "string", "currentValue": "string", "options": ["string"] }]
}`;
    const userPrompt = `Create a modern landing page for: "${description}"
RULES: Cohesive 3-4 color palette. Emoji icons. Good contrast. Bold hero. Urgent CTA.
5 sections: hero, features (3 emoji features), testimonial, cta, footer.
6-8 controls: color_picker (4-5 hex options), font_picker, tone_slider, text_editor, spacing_slider, border_radius_slider. Each targets a specific section+property.
Include globalStyles with default fontFamily, accentColor, borderRadius.`;

    let pageData;
    try { pageData = await groqJSON(systemPrompt, userPrompt); }
    catch (e: any) { return text(`Generation failed: ${e.message}`); }

    pageData.heroImageUrl = null;
    if (!pageData.globalStyles) pageData.globalStyles = { fontFamily: "system-ui, sans-serif", accentColor: "#3b82f6", borderRadius: "8px" };
    currentPage = pageData;

    return widget({
      props: pageData,
      output: text(`Generated "${pageData.businessName}" — ${pageData.sections.length} sections, ${pageData.suggestedControls.length} controls. Use the controls panel or type a refinement prompt to make changes.`),
    });
  }
);

/* ─── TOOL 2: Hero image (URL-based) ────────────────────────────────────── */

server.tool(
  {
    name: "generate-hero-image",
    description: "Set a hero image URL for the landing page.",
    schema: z.object({ imageUrl: z.string().describe("URL of image") }),
    widget: { name: "page-builder", invoking: "Setting hero image...", invoked: "Image set!" },
  },
  async ({ imageUrl }) => {
    if (!currentPage) return text("No page yet.");
    currentPage.heroImageUrl = imageUrl;
    return widget({ props: currentPage, output: text("Hero image set.") });
  }
);

/* ─── TOOL 3: Update section (property-level) ────────────────────────────── */

server.tool(
  {
    name: "update-section",
    description: "Update a specific section property — color, text, tone, font, spacing, etc. For tone changes, AI rewrites the copy.",
    schema: z.object({
      sectionId: z.string(),
      property: z.string().describe("bgColor, textColor, accentColor, tone, heading, subheading, buttonText, fontFamily, paddingY, borderRadius"),
      newValue: z.string(),
    }),
    widget: { name: "page-builder", invoking: "Updating...", invoked: "Updated!" },
  },
  async ({ sectionId, property, newValue }) => {
    if (!currentPage) return text("No page yet.");
    const section = currentPage.sections.find((s: any) => s.id === sectionId);
    if (!section) return text(`Section "${sectionId}" not found.`);

    if (property === "tone") {
      const toneLabels = ["corporate", "professional", "friendly", "casual", "playful"];
      const toneLabel = toneLabels[parseInt(newValue)] || newValue;
      const result = await groqJSON(
        `Respond ONLY valid JSON: { "heading": "string", "subheading": "string", "bodyText": "string", "buttonText": "string" }`,
        `Rewrite in ${toneLabel} tone. Keep meaning.\nHeading: "${section.heading}"\nSubheading: "${section.subheading || ""}"\nBody: "${section.bodyText || ""}"\nButton: "${section.buttonText || ""}"`
      );
      Object.assign(section, result);
    } else {
      section[property] = newValue;
    }

    const control = currentPage.suggestedControls.find((c: any) => c.targetSectionId === sectionId && c.targetProperty === property);
    if (control) control.currentValue = newValue;
    return widget({ props: currentPage, output: text(`Updated "${sectionId}" — ${property}`) });
  }
);

/* ─── TOOL 4: Refine section (natural language!) ─────────────────────────── */

server.tool(
  {
    name: "refine-section",
    description: "Refine a specific section using a natural language instruction. Example: 'make it more playful', 'add urgency', 'shorter and punchier', 'rewrite for Gen Z audience'. This is the core agentic feedback loop — the UI sends a small prompt, AI rewrites just that section.",
    schema: z.object({
      sectionId: z.string().describe("ID of the section to refine"),
      instruction: z.string().describe("Natural language instruction, e.g. 'make it more urgent', 'add a money-back guarantee mention'"),
    }),
    widget: { name: "page-builder", invoking: "Refining section...", invoked: "Refined!" },
  },
  async ({ sectionId, instruction }) => {
    if (!currentPage) return text("No page yet.");
    const section = currentPage.sections.find((s: any) => s.id === sectionId);
    if (!section) return text(`Section "${sectionId}" not found.`);

    const result = await groqJSON(
      `You are a landing page copywriter. Respond ONLY valid JSON: { "heading": "string", "subheading": "string", "bodyText": "string", "buttonText": "string" }. Only include fields that exist in the original — if a field was empty, keep it empty.`,
      `Refine this ${section.type} section. Instruction: "${instruction}"
Current copy:
- Heading: "${section.heading}"
- Subheading: "${section.subheading || ""}"
- Body: "${section.bodyText || ""}"
- Button: "${section.buttonText || ""}"

Apply the instruction while keeping the overall brand voice consistent. Be creative but don't over-write.`
    );

    // Only overwrite non-empty fields from the result
    if (result.heading) section.heading = result.heading;
    if (result.subheading) section.subheading = result.subheading;
    if (result.bodyText) section.bodyText = result.bodyText;
    if (result.buttonText) section.buttonText = result.buttonText;

    return widget({
      props: currentPage,
      output: text(`Refined "${sectionId}" with instruction: "${instruction}"`),
    });
  }
);

/* ─── TOOL 5: Global update ──────────────────────────────────────────────── */

server.tool(
  {
    name: "global-update",
    description: "Apply a property change across ALL sections. Use for global font, accent color, border radius, padding.",
    schema: z.object({
      property: z.string().describe("fontFamily, accentColor, bgColor, textColor, borderRadius, paddingY"),
      newValue: z.string(),
    }),
    widget: { name: "page-builder", invoking: "Applying globally...", invoked: "All sections updated!" },
  },
  async ({ property, newValue }) => {
    if (!currentPage) return text("No page yet.");
    for (const section of currentPage.sections) section[property] = newValue;
    if (currentPage.globalStyles) currentPage.globalStyles[property] = newValue;
    return widget({ props: currentPage, output: text(`Applied ${property} = "${newValue}" globally.`) });
  }
);

/* ─── TOOL 6: Reorder sections ───────────────────────────────────────────── */

server.tool(
  {
    name: "reorder-sections",
    description: "Move a section up or down.",
    schema: z.object({ sectionId: z.string(), direction: z.enum(["up", "down"]) }),
    widget: { name: "page-builder", invoking: "Reordering...", invoked: "Reordered!" },
  },
  async ({ sectionId, direction }) => {
    if (!currentPage) return text("No page yet.");
    const idx = currentPage.sections.findIndex((s: any) => s.id === sectionId);
    if (idx === -1) return text(`Section "${sectionId}" not found.`);
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= currentPage.sections.length) return text("Already at edge.");
    [currentPage.sections[idx], currentPage.sections[newIdx]] = [currentPage.sections[newIdx], currentPage.sections[idx]];
    return widget({ props: currentPage, output: text(`Moved "${sectionId}" ${direction}.`) });
  }
);

/* ─── TOOL 7: Analyze page (AI feedback) ─────────────────────────────────── */

server.tool(
  {
    name: "analyze-page",
    description: "AI analyzes the current page and suggests specific improvements with auto-fixable actions. The agentic feedback loop: widget triggers analysis → AI critiques → user applies fixes → widget updates.",
    schema: z.object({}),
    widget: { name: "page-builder", invoking: "Analyzing your page...", invoked: "Analysis ready!" },
  },
  async () => {
    if (!currentPage) return text("No page yet.");
    const snapshot = JSON.stringify({
      businessName: currentPage.businessName,
      sections: currentPage.sections.map((s: any) => ({
        id: s.id, type: s.type, heading: s.heading, subheading: s.subheading,
        bgColor: s.bgColor, textColor: s.textColor, accentColor: s.accentColor,
        fontFamily: s.fontFamily, buttonText: s.buttonText, bodyText: s.bodyText,
      })),
    });

    const result = await groqJSON(
      `You are a landing page design critic. Respond ONLY valid JSON: { "issues": [{ "sectionId": "string", "severity": "high|medium|low", "issue": "string", "suggestion": "string", "autoFix": { "tool": "update-section|refine-section|global-update", "args": {} } }], "overallScore": number, "summary": "string" }. 
For autoFix, provide the exact tool name and args to fix the issue:
- update-section: { "sectionId": "...", "property": "...", "newValue": "..." }
- refine-section: { "sectionId": "...", "instruction": "..." }
- global-update: { "property": "...", "newValue": "..." }`,
      `Analyze this landing page. Find 3-5 specific issues with actionable fixes:\n${snapshot}`
    );

    return widget({
      props: { ...currentPage, _analysis: result },
      output: text(`Page score: ${result.overallScore}/10. ${result.summary}`),
    });
  }
);

/* ─── TOOL 8: Regenerate ─────────────────────────────────────────────────── */

server.tool(
  {
    name: "regenerate-page",
    description: "Regenerate the entire page with additional instructions.",
    schema: z.object({ originalDescription: z.string(), additionalInstructions: z.string() }),
    widget: { name: "page-builder", invoking: "Redesigning...", invoked: "Done!" },
  },
  async ({ originalDescription, additionalInstructions }) => {
    const pageData = await groqJSON(
      `Expert landing page designer. Respond ONLY valid JSON with businessName, tagline, globalStyles: {fontFamily, accentColor, borderRadius}, sections (5: hero, features, testimonial, cta, footer with emoji icons), suggestedControls (6-8).`,
      `Create page for: "${originalDescription}"\nIMPORTANT: ${additionalInstructions}`
    );
    pageData.heroImageUrl = currentPage?.heroImageUrl || null;
    if (!pageData.globalStyles) pageData.globalStyles = { fontFamily: "system-ui, sans-serif", accentColor: "#3b82f6", borderRadius: "8px" };
    currentPage = pageData;
    return widget({ props: pageData, output: text("Regenerated!") });
  }
);

server.listen().then(() => console.log("Generative Control Surfaces v3 running on Groq"));