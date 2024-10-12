import z from 'zod';
import {groupClassesSchema} from "./GroupClassesSchema";

export const dataObjectSchema = z.object({
  data: z.array(groupClassesSchema),
})

export type DataObject = z.infer<typeof dataObjectSchema>;