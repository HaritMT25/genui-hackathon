import { MCPServer, text, widget } from "mcp-use/server";
import { z } from "zod";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// Model for generating full landing pages
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
            "Controls specific to what was generated. If you made a gradient hero, suggest a gradient picker. If copy is formal, suggest a tone slider.",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              type: {
                type: SchemaType.STRING,
                description:
                  "color_picker | tone_slider | layout_toggle | text_editor",
              },
              label: { type: SchemaType.STRING },
              targetSectionId: { type: SchemaType.STRING },
              targetProperty: { type: SchemaType.STRING },
              currentValue: { type: SchemaType.STRING },
              options: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
            },
            required: ["id", "type", "label", "targetSectionId"],
          },
        },
      },
      required: ["businessName", "sections", "suggestedControls"],
    },
  },
});

const server = new MCPServer({
  name: "generative-control-surfaces",
  title: "Generative Control Surfaces",
  version: "1.0.0",
  description:
    "AI generates landing pages AND contextual control widgets to edit them without prompting",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "favicon.ico",
  icons: [{ src: "icon.svg", mimeType: "image/svg+xml", sizes: ["512x512"] }],
});

// In-memory store for the current page state (per session)
let currentPage: any = null;

server.tool(
  {
    name: "generate-landing-page",
    description:
      "Generate a complete landing page with contextual editing controls. The user describes a business and gets a live preview + interactive control panel.",
    schema: z.object({
      description: z
        .string()
        .describe("Business description, e.g. 'Boston coffee roastery with a cozy vibe'"),
    }),
    widget: {
      name: "landing-page",
      invoking: "Designing your page...",
      invoked: "Page ready!",
    },
  },
  async ({ description }) => {
    const prompt = `You are a landing page designer. Create a modern, compelling landing page for this business:

"${description}"

Generate 4-5 sections (hero, features, testimonial, cta, footer).
For each section, pick colors that fit the brand.
Also generate 4-6 contextual editing controls — these should be SPECIFIC to what you created:
- If you used a dark hero, suggest a light/dark toggle
- If the copy is formal, suggest a tone slider
- If you picked specific brand colors, suggest a color picker targeting those sections
- If there's a CTA, suggest a text editor for the button copy
Be creative with the controls — they should feel like they were designed for THIS specific page.`;

    const result = await pageModel.generateContent(prompt);
    const pageData = JSON.parse(result.response.text());
    currentPage = pageData;

    return widget({
      props: pageData,
      output: text(
        `Generated landing page for "${pageData.businessName}" with ${pageData.sections.length} sections and ${pageData.suggestedControls.length} editing controls.`
      ),
    });
  }
);

server.tool(
  {
    name: "show-controls",
    description:
      "Show the interactive control panel for the current landing page. Users can adjust colors, tone, layout, and text without typing prompts.",
    schema: z.object({}),
    widget: {
      name: "control-panel",
      invoking: "Building controls...",
      invoked: "Controls ready!",
    },
  },
  async () => {
    if (!currentPage) {
      return text("No page generated yet. Use generate-landing-page first.");
    }

    return widget({
      props: {
        controls: currentPage.suggestedControls,
        sections: currentPage.sections,
      },
      output: text(
        `Showing ${currentPage.suggestedControls.length} contextual controls`
      ),
    });
  }
);

// Model for partial updates (lighter schema)
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

server.tool(
  {
    name: "update-section",
    description:
      "Update a specific section based on a control change. Only regenerates the targeted section.",
    schema: z.object({
      sectionId: z.string(),
      property: z.string().describe("Which property changed, e.g. 'bgColor', 'tone', 'layout'"),
      newValue: z.string(),
    }),
    widget: {
      name: "landing-page",
      invoking: "Updating...",
      invoked: "Updated!",
    },
  },
  async ({ sectionId, property, newValue }) => {
    if (!currentPage) {
      return text("No page to update.");
    }

    const section = currentPage.sections.find((s: any) => s.id === sectionId);
    if (!section) {
      return text(`Section ${sectionId} not found.`);
    }

    // For simple property changes (colors), just update directly
    if (["bgColor", "textColor", "accentColor"].includes(property)) {
      section[property] = newValue;
    } else if (property === "tone") {
      // For tone changes, ask Gemini to rewrite the copy
      const toneLabels = ["corporate", "professional", "friendly", "casual", "playful"];
      const toneLabel = toneLabels[parseInt(newValue)] || newValue;

      const prompt = `Rewrite this section copy in a ${toneLabel} tone. Keep the same meaning.
Current heading: "${section.heading}"
Current subheading: "${section.subheading || ""}"
Current body: "${section.bodyText || ""}"
Current button: "${section.buttonText || ""}"`;

      const result = await updateModel.generateContent(prompt);
      const updated = JSON.parse(result.response.text());
      Object.assign(section, updated);
    } else if (property === "text") {
      section[newValue.split(":")[0]] = newValue.split(":").slice(1).join(":");
    }

    return widget({
      props: currentPage,
      output: text(`Updated section "${sectionId}" — changed ${property}`),
    });
  }
);

server.listen().then(() => console.log("Generative Control Surfaces running"));