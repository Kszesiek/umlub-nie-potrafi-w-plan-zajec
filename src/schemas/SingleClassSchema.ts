import z from 'zod';

export const singleClassSchema = z.object({
  course_name: z.string(),
  katedra: z.nullable(z.string()),
  day: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  type: z.nullable(z.string()),
  location: z.nullable(z.string()),
})

export type SingleClass = z.infer<typeof singleClassSchema>;