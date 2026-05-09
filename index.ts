import { MCPServer, text, widget } from "mcp-use/server";
import { z } from "zod";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const pageModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        businessName: { type: SchemaType.STRING },
        tagline: { type: SchemaType.STRING },
        sections: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              type: {
                type: SchemaType.STRING,
                description: "hero | features | testimonial | cta | footer",
              },
              heading: { type: SchemaType.STRING },
              subheading: { type: SchemaType.STRING },
              bodyText: { type: SchemaType.STRING },
              buttonText: { type: SchemaType.STRING },
              features: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    icon: { type: SchemaType.STRING },
                    title: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING },
                  },
                  required: ["title", "description"],
                },
              },
              bgColor: { type: SchemaType.STRING },
              textColor: { type: SchemaType.STRING },
              accentColor: { type: SchemaType.STRING },
            },
            required: ["id", "type", "heading"],
          },
        },
        suggestedControls: {
          type: SchemaType.ARRAY,
          description:
            "Controls specific to what was generated. If you made a gradient hero, suggest a gradient picker. If copy is formal, suggest a tone slider. Be creative and specific.",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              type: {
                type: SchemaType.STRING,
                description:
                  "color_picker | tone_slider | layout_toggle | text_editor",
              },
              label: {
                type: SchemaType.STRING,
                description:
                  "Human-readable label like 'Hero Background' or 'CTA Tone'",
              },
              targetSectionId: { type: SchemaType.STRING },
              targetProperty: {
                type: SchemaType.STRING,
                description:
                  "Which property this controls: bgColor, textColor, accentColor, tone, heading, subheading, buttonText",
              },
              currentValue: { type: SchemaType.STRING },
              options: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description:
                  "For layout_toggle: the layout options. For color_picker: suggested colors.",
              },
            },
            required: ["id", "type", "label", "targetSectionId", "targetProperty"],
          },
        },
      },
      required: ["businessName", "sections", "suggestedControls"],
    },
  },
});

const updateModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        heading: { type: SchemaType.STRING },
        subheading: { type: SchemaType.STRING },
        bodyText: { type: SchemaType.STRING },
        buttonText: { type: SchemaType.STRING },
        bgColor: { type: SchemaType.STRING },
        textColor: { type: SchemaType.STRING },
        accentColor: { type: SchemaType.STRING },
      },
    },
  },
});

const server = new MCPServer({
  name: "generative-control-surfaces",
  title: "Generative Control Surfaces",
  version: "1.0.0",
  description:
    "AI generates landing pages AND contextual control widgets to edit them — no prompting needed",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "favicon.ico",
  icons: [{ src: "icon.svg", mimeType: "image/svg+xml", sizes: ["512x512"] }],
});

// In-memory page state
let currentPage: any = null;

// ─── TOOL 1: Generate landing page + controls ────────────────────────────────

server.tool(
  {
    name: "generate-landing-page",
    description:
      "Generate a complete landing page with contextual editing controls. The user describes a business and gets a live preview with an interactive control panel. The controls are AI-generated and specific to the page content.",
    schema: z.object({
      description: z
        .string()
        .describe(
          "Business description, e.g. 'Boston coffee roastery with a cozy artisan vibe'"
        ),
    }),
    widget: {
      name: "page-builder",
      invoking: "Designing your page...",
      invoked: "Page ready!",
    },
  },
  async ({ description }) => {
    const prompt = `You are a landing page designer. Create a modern, compelling landing page for this business:

"${description}"

Generate exactly 5 sections in this order: hero, features, testimonial, cta, footer.
For each section, pick colors that fit the brand identity.

Also generate 4-6 contextual editing controls. These MUST be specific to what you created:
- If you used a dark hero background, suggest a color_picker targeting the hero bgColor
- If the copy is formal, suggest a tone_slider targeting that section
- If you picked specific brand colors, suggest a color_picker for the accent
- If there's a CTA button, suggest a text_editor for the buttonText
- If there are features, suggest a text_editor for the features heading

Make the controls feel like they were designed for THIS specific page, not generic.
Each control needs: id, type, label, targetSectionId, targetProperty, currentValue.
For color_picker: include 4-5 suggested colors in options that fit the brand.
For layout_toggle: include options like "centered", "split-left", "split-right", "full-bleed".`;

    const result = await pageModel.generateContent(prompt);
    const pageData = JSON.parse(result.response.text());
    currentPage = pageData;

    return widget({
      props: pageData,
      output: text(
        `Generated landing page for "${pageData.businessName}" with ${pageData.sections.length} sections and ${pageData.suggestedControls.length} editing controls. Open the widget fullscreen for the best experience!`
      ),
    });
  }
);

// ─── TOOL 2: Update a section (partial regeneration) ─────────────────────────

server.tool(
  {
    name: "update-section",
    description:
      "Update a specific section of the landing page based on a control change. Only regenerates the targeted section, not the whole page. Use this when the user adjusts a control like color, tone, or text.",
    schema: z.object({
      sectionId: z.string().describe("ID of the section to update"),
      property: z
        .string()
        .describe(
          "Which property changed: bgColor, textColor, accentColor, tone, heading, subheading, buttonText"
        ),
      newValue: z.string().describe("The new value for the property"),
    }),
    widget: {
      name: "page-builder",
      invoking: "Updating your page...",
      invoked: "Updated!",
    },
  },
  async ({ sectionId, property, newValue }) => {
    if (!currentPage) {
      return text("No page generated yet. Use generate-landing-page first.");
    }

    const section = currentPage.sections.find((s: any) => s.id === sectionId);
    if (!section) {
      return text(`Section "${sectionId}" not found.`);
    }

    // Direct property updates (colors, text)
    if (
      ["bgColor", "textColor", "accentColor", "heading", "subheading", "buttonText", "bodyText"].includes(
        property
      )
    ) {
      section[property] = newValue;
    } else if (property === "tone") {
      // Tone changes need Gemini to rewrite the copy
      const toneLabels = [
        "corporate",
        "professional",
        "friendly",
        "casual",
        "playful",
      ];
      const toneLabel = toneLabels[parseInt(newValue)] || newValue;

      const prompt = `Rewrite this landing page section copy in a ${toneLabel} tone. Keep the same meaning and intent but change the voice.
Current heading: "${section.heading}"
Current subheading: "${section.subheading || ""}"
Current body: "${section.bodyText || ""}"
Current button text: "${section.buttonText || ""}"

Return updated values for all fields.`;

      const result = await updateModel.generateContent(prompt);
      const updated = JSON.parse(result.response.text());
      Object.assign(section, updated);
    } else if (property === "layout") {
      section.layout = newValue;
    }

    // Also update the control's currentValue
    const control = currentPage.suggestedControls.find(
      (c: any) => c.targetSectionId === sectionId && c.targetProperty === property
    );
    if (control) {
      control.currentValue = newValue;
    }

    return widget({
      props: currentPage,
      output: text(
        `Updated "${sectionId}" section — changed ${property} to "${newValue}"`
      ),
    });
  }
);

// ─── TOOL 3: Regenerate the whole page with tweaks ───────────────────────────

server.tool(
  {
    name: "regenerate-page",
    description:
      "Regenerate the entire page with additional instructions. Use when the user wants major changes that affect multiple sections.",
    schema: z.object({
      originalDescription: z
        .string()
        .describe("The original business description"),
      additionalInstructions: z
        .string()
        .describe(
          "What to change, e.g. 'make it darker and more minimal' or 'add more playful copy'"
        ),
    }),
    widget: {
      name: "page-builder",
      invoking: "Redesigning your page...",
      invoked: "Page ready!",
    },
  },
  async ({ originalDescription, additionalInstructions }) => {
    const prompt = `You are a landing page designer. Create a modern, compelling landing page for this business:

"${originalDescription}"

IMPORTANT additional requirements: ${additionalInstructions}

Generate exactly 5 sections in this order: hero, features, testimonial, cta, footer.
Also generate 4-6 contextual editing controls specific to what you built.
Each control needs: id, type, label, targetSectionId, targetProperty, currentValue.`;

    const result = await pageModel.generateContent(prompt);
    const pageData = JSON.parse(result.response.text());
    currentPage = pageData;

    return widget({
      props: pageData,
      output: text(
        `Regenerated page for "${pageData.businessName}" with new instructions applied.`
      ),
    });
  }
);

server.listen().then(() => console.log("Generative Control Surfaces running"));