import { z } from "zod";

const email = z.email("Informe um e-mail válido.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe sua senha."),
});

export const signupSchema = z
  .object({
    email,
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export const totpCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "O código tem 6 números."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type TotpCodeInput = z.infer<typeof totpCodeSchema>;
