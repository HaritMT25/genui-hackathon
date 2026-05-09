import { z } from "zod";

export const propSchema = z.object({
  businessName: z.string(),
  tagline: z.string().optional(),
  sections: z.array(
    z.object({
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
});

export type PageBuilderProps = z.infer<typeof propSchema>;
