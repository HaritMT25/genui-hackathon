import { z } from "zod";

const sectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  heading: z.string(),
  subheading: z.string().optional(),
  bodyText: z.string().optional(),
  buttonText: z.string().optional(),
  features: z
    .array(
      z.object({
        icon: z.string().optional(),
        title: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
});

export const propSchema = z.object({
  businessName: z.string(),
  tagline: z.string().optional(),
  sections: z.array(sectionSchema),
  suggestedControls: z.array(z.any()).optional(),
});

export type LandingPageProps = z.infer<typeof propSchema>;