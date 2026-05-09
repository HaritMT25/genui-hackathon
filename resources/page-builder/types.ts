import { z } from "zod";

export const propSchema = z.object({
  businessName: z.string(),
  tagline: z.string().optional(),
  heroImageUrl: z.string().nullable().optional(),
  globalStyles: z.object({
    fontFamily: z.string().optional(),
    accentColor: z.string().optional(),
    borderRadius: z.string().optional(),
  }).optional(),
  sections: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      heading: z.string(),
      subheading: z.string().optional(),
      bodyText: z.string().optional(),
      buttonText: z.string().optional(),
      features: z
        .array(z.object({ icon: z.string().optional(), title: z.string(), description: z.string() }))
        .optional(),
      bgColor: z.string().optional(),
      textColor: z.string().optional(),
      accentColor: z.string().optional(),
      fontFamily: z.string().optional(),
      borderRadius: z.string().optional(),
      paddingY: z.string().optional(),
      layout: z.string().optional(),
    })
  ),
  suggestedControls: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      targetSectionId: z.string(),
      targetProperty: z.string(),
      currentValue: z.string().optional(),
      options: z.array(z.string()).optional(),
    })
  ),
  _analysis: z.object({
    issues: z.array(z.object({
      sectionId: z.string(),
      severity: z.string(),
      issue: z.string(),
      suggestion: z.string(),
      autoFix: z.object({
        tool: z.string(),
        args: z.record(z.any()),
      }).optional(),
    })).optional(),
    overallScore: z.number().optional(),
    summary: z.string().optional(),
  }).optional(),
});

export type PageBuilderProps = z.infer<typeof propSchema>;