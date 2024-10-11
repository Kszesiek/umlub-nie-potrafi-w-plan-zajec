import z from 'zod';
import {singleClassSchema} from "./SingleClassSchema";

export const weekClassesSchema = z.object({
  week: z.number(),
  classes: z.array(singleClassSchema),
})

export type WeekClasses = z.infer<typeof weekClassesSchema>;