import { z } from "zod";

export const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().trim().min(5, {
    message: "Password must be at least 5 characters.",
  }),
});
