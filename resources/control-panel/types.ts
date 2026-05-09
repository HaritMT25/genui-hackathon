import { z } from "zod";

export const propSchema = z.object({
  controls: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      targetSectionId: z.string(),
      targetProperty: z.string().optional(),
      currentValue: z.string().optional(),
      options: z.array(z.string()).optional(),
    })
  ),
  sections: z.array(z.any()).optional(),
});

export type ControlPanelProps = z.infer<typeof propSchema>;