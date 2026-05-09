// Auto-generated tool registry types - DO NOT EDIT MANUALLY
// This file is regenerated whenever tools are added, removed, or updated during development
// Generated at: 2026-05-09T19:28:34.802Z

declare module "mcp-use/react" {
  interface ToolRegistry {
    "generate-hero-image": {
      input: { "imagePrompt": string };
      output: Record<string, unknown>;
    };
    "generate-landing-page": {
      input: { "description": string };
      output: Record<string, unknown>;
    };
    "regenerate-page": {
      input: { "originalDescription": string; "additionalInstructions": string };
      output: Record<string, unknown>;
    };
    "update-section": {
      input: { "sectionId": string; "property": string; "newValue": string };
      output: Record<string, unknown>;
    };
  }
}

export {};
