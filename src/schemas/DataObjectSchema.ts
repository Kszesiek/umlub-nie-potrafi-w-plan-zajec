import z from 'zod';
import {groupClassesSchema} from "./GroupClassesSchema";

export const dataObjectSchema = z.object({
  data: z.array(groupClassesSchema),
})

type DataObject = z.infer<typeof dataObjectSchema>;