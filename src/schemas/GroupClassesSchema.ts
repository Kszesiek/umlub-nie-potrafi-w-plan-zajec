import z from 'zod';
import {weekClassesSchema} from "./WeekClassesSchema";

export const groupClassesSchema = z.object({
  groups: z.array(z.number()),
  weeks: z.array(weekClassesSchema),
  katedra: z.string(),
})

export type GroupClasses = z.infer<typeof groupClassesSchema>;