import z from "zod";

export const signSchema = z.object({
    email : z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(1, "Full name is required").max(50, "Full name must be less than 50 characters"),
    profilePic: z.string().optional().default(""),
})

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})