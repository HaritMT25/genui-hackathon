// Auto-generated tool registry types - DO NOT EDIT MANUALLY
// This file is regenerated whenever tools are added, removed, or updated during development
// Generated at: 2026-05-09T21:25:39.353Z

declare module "mcp-use/react" {
  interface ToolRegistry {
    "analyze-page": {
      input: Record<string, never>;
      output: Record<string, unknown>;
    };
    "generate-hero-image": {
      input: { "imageUrl": string };
      output: Record<string, unknown>;
    };
    "generate-landing-page": {
      input: { "description": string };
      output: Record<string, unknown>;
    };
    "global-update": {
      input: { "property": string; "newValue": string };
      output: Record<string, unknown>;
    };
    "refine-section": {
      input: { "sectionId": string; "instruction": string };
      output: Record<string, unknown>;
    };
    "regenerate-page": {
      input: { "originalDescription": string; "additionalInstructions": string };
      output: Record<string, unknown>;
    };
    "reorder-sections": {
      input: { "sectionId": string; "direction": "up" | "down" };
      output: Record<string, unknown>;
    };
    "update-section": {
      input: { "sectionId": string; "property": string; "newValue": string };
      output: Record<string, unknown>;
    };
  }
}

export {};
