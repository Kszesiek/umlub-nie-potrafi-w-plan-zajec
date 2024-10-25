import z from 'zod';
import {singleClassSchema} from "./SingleClassSchema";

export const groupClassesSchema = z.object({
  group: z.number(),
  week: z.number(),
  classes: z.array(singleClassSchema),
})

export type GroupClasses = z.infer<typeof groupClassesSchema>;