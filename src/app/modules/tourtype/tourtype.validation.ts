import z from "zod";

export const createTourTypeZodSchema = z.object({
    name: z.string(),
});