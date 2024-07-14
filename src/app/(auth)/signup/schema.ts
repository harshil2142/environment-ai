import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().trim().min(5, {
    message: "Password must be at least 5 characters.",
  }),
  department: z.string().optional(),
});
