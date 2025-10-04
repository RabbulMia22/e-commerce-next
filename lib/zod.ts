import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email({ message: "Please enter a valid email address" })
  .transform((value) => value.toLowerCase());

const passwordField = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(64, { message: "Password must be less than 64 characters" })
  .refine((value) => /[a-zA-Z]/.test(value), {
    message: "Password must include at least one letter",
  })
  .refine((value) => /[0-9]/.test(value), {
    message: "Password must include at least one number",
  });

const nameField = z
  .string()
  .trim()
  .min(2, { message: "Must be at least 2 characters" })
  .max(60, { message: "Must be less than 60 characters" });

const optionalPhoneField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .refine((value) => !value || /^\+?\d{7,15}$/.test(value), {
    message: "Enter a valid phone number",
  });

export const signInSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const registerSchema = z
  .object({
    firstName: nameField,
    lastName: nameField,
    email: emailField,
  phone: optionalPhoneField,
    password: passwordField,
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Reset token is required" }),
    password: passwordField,
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
      });
    }
  });

export const updateProfileSchema = z.object({
  name: nameField.optional(),
  phone: optionalPhoneField,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: passwordField,
    confirmNewPassword: z
      .string()
      .min(1, { message: "Please confirm your new password" }),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        path: ["confirmNewPassword"],
        code: z.ZodIssueCode.custom,
        message: "New passwords do not match",
      });
    }
    if (data.currentPassword === data.newPassword) {
      ctx.addIssue({
        path: ["newPassword"],
        code: z.ZodIssueCode.custom,
        message: "New password must be different from the current password",
      });
    }
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;