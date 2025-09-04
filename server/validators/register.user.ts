// utils/validators/register.user.ts
import { z } from "zod";

const registerUserSchema = z.object({
 email: z.string({message: "Email is required"}).email(),
 password: z.string({ message: "Password is required"})
            .min(6, "Password must be at least 6 characters"),
 name: z.string({message: "Name is required"})
        .min(2, "Name cannot be less than 2 characters."),
})

export async function validateRegisterUser(data: typeof registerUserSchema) {
 const result = await registerUserSchema.safeParseAsync(data);
 if( result.error ){ // 3
  throw createError({
   statusCode: 400,
   statusMessage: result.error.message
  })
 }
}