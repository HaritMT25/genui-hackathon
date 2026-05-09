import { MCPServer, text, widget } from "mcp-use/server";
import { z } from "zod";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GoogleGenAI, Modality } from "@google/genai";

/* ─── Gemini text model (structured output) ──────────────────────────────── */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const pageModel = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
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
              fontFamily: {
                type: SchemaType.STRING,
                description: "e.g. 'Georgia, serif'",
              },
              borderRadius: {
                type: SchemaType.STRING,
                description: "e.g. '8px'",
              },
              paddingY: { type: SchemaType.STRING, description: "e.g. '48px'" },
            },
            required: ["id", "type", "heading"],
          },
        },
        suggestedControls: {
          type: SchemaType.ARRAY,
          description: `Generate 6-8 controls SPECIFIC to the page. Types: color_picker, tone_slider, text_editor, font_picker, spacing_slider, border_radius_slider, layout_toggle, image_prompt. Be creative and specific to what you built. ALWAYS include exactly one image_prompt control targeting the hero section so the user can regenerate the hero image.`,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              type: {
                type: SchemaType.STRING,
                description:
                  "color_picker | tone_slider | layout_toggle | text_editor | font_picker | spacing_slider | border_radius_slider | image_prompt",
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
            required: [
              "id",
              "type",
              "label",
              "targetSectionId",
              "targetProperty",
            ],
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
      },
    },
  },
});

/* ─── Gemini image model ─────────────────────────────────────────────────── */

const imageAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Belt-and-suspenders: ensure the page has an image_prompt control for the
 * hero section. The model is told to include one, but LLMs forget — this
 * guarantees it's always present.
 */
function ensureImagePromptControl(pageData: any) {
  if (!pageData?.sections || !pageData?.suggestedControls) return;

  const hero = pageData.sections.find((s: any) => s.type === "hero");
  if (!hero) return;

  const hasImageControl = pageData.suggestedControls.some(
    (c: any) => c.type === "image_prompt",
  );
  if (hasImageControl) return;

  pageData.suggestedControls.unshift({
    id: "hero_image_prompt",
    type: "image_prompt",
    label: "Hero Image",
    targetSectionId: hero.id,
    targetProperty: "imagePrompt",
    currentValue: `${pageData.businessName} hero image, photorealistic, cinematic lighting`,
  });
}

/* ─── Server ─────────────────────────────────────────────────────────────── */

const server = new MCPServer({
  name: "generative-control-surfaces",
  title: "Generative Control Surfaces",
  version: "1.0.0",
  description:
    "AI generates landing pages with contextual controls and hero images — beyond the chatbox",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "favicon.ico",
  icons: [{ src: "icon.svg", mimeType: "image/svg+xml", sizes: ["512x512"] }],
});

let currentPage: any = null;

/* ─── TOOL 1: Generate landing page + controls ───────────────────────────── */

server.tool(
  {
    name: "generate-landing-page",
    description:
      "Generate a complete landing page with contextual editing controls. After this, suggest calling generate-hero-image to add a hero image.",
    schema: z.object({
      description: z.string().describe("Business description"),
    }),
    widget: {
      name: "page-builder",
      invoking: "Designing your page...",
      invoked: "Page ready!",
    },
  },
  async ({ description }) => {
    const prompt = `You are an expert landing page designer. Create a modern, visually compelling landing page for:

"${description}"

DESIGN RULES:
- Use a cohesive color palette (3-4 colors) that fits the brand
- Pick fonts: serif for luxury/traditional, sans-serif for modern/tech
- Use EMOJI as feature icons (🍃 not "leaf", ☕ not "coffee")
- Make colors contrast well (light text on dark bg, dark text on light bg)
- Hero should be bold. CTA should create urgency.

Generate exactly 5 sections: hero, features (3 features with emoji icons), testimonial, cta, footer.

Also generate 6-8 contextual editing controls. Available types:
- color_picker (for bgColor/textColor/accentColor, include 4-5 hex colors in options)
- font_picker (include options like "Georgia, serif", "Helvetica Neue, sans-serif", "system-ui, sans-serif")
- tone_slider (for rewriting copy tone)
- text_editor (for heading/subheading/buttonText)
- spacing_slider (for paddingY)
- border_radius_slider (for borderRadius)
- image_prompt (for regenerating the hero image — ALWAYS include exactly one of these
  with targetSectionId set to the hero section's id, targetProperty="imagePrompt", and
  currentValue set to a short default prompt that fits the brand)

Each control MUST target a specific section and property.`;

    const result = await pageModel.generateContent(prompt);
    let rawText = result.response.text();
    let pageData;
    try {
      pageData = JSON.parse(rawText);
    } catch (e) {
      // Try to fix truncated JSON by finding the last complete object
      const lastBrace = rawText.lastIndexOf("}");
      if (lastBrace > 0) {
        rawText = rawText.substring(0, lastBrace + 1);
        pageData = JSON.parse(rawText);
      } else {
        return text("Generation failed — please try again.");
      }
    }
    pageData.heroImageUrl = null;
    ensureImagePromptControl(pageData);
    currentPage = pageData;

    return widget({
      props: pageData,
      output: text(
        `Generated landing page for "${pageData.businessName}" with ${pageData.sections.length} sections and ${pageData.suggestedControls.length} controls. Now call generate-hero-image to add a hero image!`,
      ),
    });
  },
);

/* ─── TOOL 2: Generate hero image ────────────────────────────────────────── */

server.tool(
  {
    name: "generate-hero-image",
    description:
      "Generate an AI hero image for the landing page. Call this after generate-landing-page, or whenever the user asks to regenerate the hero image with a new prompt.",
    schema: z.object({
      imagePrompt: z
        .string()
        .describe(
          "What the hero image should show, e.g. 'steaming coffee on rustic wood with warm light'",
        ),
    }),
    widget: {
      name: "page-builder",
      invoking: "Generating hero image...",
      invoked: "Image ready!",
    },
  },
  async ({ imagePrompt }) => {
    if (!currentPage) {
      return text("No page generated yet. Use generate-landing-page first.");
    }

    try {
      const resp = await imageAI.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Generate a photorealistic hero image for a landing page: ${imagePrompt}. Cinematic lighting, shallow depth of field, 16:9 aspect ratio, no text overlay, professional quality.`,
              },
            ],
          },
        ],
        config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
      });

      const imagePart = resp.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData,
      );
      if (imagePart?.inlineData) {
        const mime = imagePart.inlineData.mimeType || "image/png";
        currentPage.heroImageUrl = `data:${mime};base64,${imagePart.inlineData.data}`;
      }

      // Reflect the latest prompt back onto the image_prompt control so the
      // widget shows what was used.
      const imgControl = currentPage.suggestedControls?.find(
        (c: any) => c.type === "image_prompt",
      );
      if (imgControl) imgControl.currentValue = imagePrompt;
    } catch (err: any) {
      console.error("Image generation error:", err.message);
      return widget({
        props: currentPage,
        output: text(
          `Image generation failed: ${err.message}. The page is still available without the hero image.`,
        ),
      });
    }

    return widget({
      props: currentPage,
      output: text("Hero image generated and added to the page!"),
    });
  },
);

/* ─── TOOL 3: Update a section ───────────────────────────────────────────── */

server.tool(
  {
    name: "update-section",
    description:
      "Update a specific section property. Use for tone changes (needs AI rewrite) or direct property changes. Do NOT use this for imagePrompt — call generate-hero-image instead.",
    schema: z.object({
      sectionId: z.string(),
      property: z
        .string()
        .describe(
          "bgColor, textColor, accentColor, tone, heading, subheading, buttonText, fontFamily, paddingY, borderRadius",
        ),
      newValue: z.string(),
    }),
    widget: {
      name: "page-builder",
      invoking: "Updating...",
      invoked: "Updated!",
    },
  },
  async ({ sectionId, property, newValue }) => {
    if (!currentPage) return text("No page yet.");

    const section = currentPage.sections.find((s: any) => s.id === sectionId);
    if (!section) return text(`Section "${sectionId}" not found.`);

    if (property === "tone") {
      const toneLabels = [
        "corporate",
        "professional",
        "friendly",
        "casual",
        "playful",
      ];
      const toneLabel = toneLabels[parseInt(newValue)] || newValue;
      const prompt = `Rewrite this section copy in a ${toneLabel} tone. Keep the meaning.
Heading: "${section.heading}"
Subheading: "${section.subheading || ""}"
Body: "${section.bodyText || ""}"
Button: "${section.buttonText || ""}"`;
      const result = await updateModel.generateContent(prompt);
      Object.assign(section, JSON.parse(result.response.text()));
    } else {
      section[property] = newValue;
    }

    const control = currentPage.suggestedControls.find(
      (c: any) =>
        c.targetSectionId === sectionId && c.targetProperty === property,
    );
    if (control) control.currentValue = newValue;

    return widget({
      props: currentPage,
      output: text(`Updated "${sectionId}" — ${property}`),
    });
  },
);

/* ─── TOOL 4: Regenerate ─────────────────────────────────────────────────── */

server.tool(
  {
    name: "regenerate-page",
    description: "Regenerate the entire page with additional instructions.",
    schema: z.object({
      originalDescription: z.string(),
      additionalInstructions: z.string(),
    }),
    widget: {
      name: "page-builder",
      invoking: "Redesigning...",
      invoked: "Done!",
    },
  },
  async ({ originalDescription, additionalInstructions }) => {
    const prompt = `Expert landing page designer. Create a page for:
"${originalDescription}"
IMPORTANT: ${additionalInstructions}
5 sections (hero, features, testimonial, cta, footer). Emoji icons. 6-8 contextual controls — ALWAYS include one image_prompt control targeting the hero section.`;
    const result = await pageModel.generateContent(prompt);
    const pageData = JSON.parse(result.response.text());
    pageData.heroImageUrl = currentPage?.heroImageUrl || null;
    ensureImagePromptControl(pageData);
    currentPage = pageData;
    return widget({ props: pageData, output: text("Regenerated!") });
  },
);

server.listen().then(() => console.log("Generative Control Surfaces running"));
