import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Mot de passe minimum 6 caractères"),
    confirmPassword: z.string(),
    name: z.string().min(2, "Nom requis"),
    role: z.enum(["STUDENT", "TEACHER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const courseSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().optional(),
});

export const resourceSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  type: z.enum(["PDF", "TEXT"]),
  content: z.string().optional(),
});

export const quizSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  courseId: z.string().min(1, "Cours requis"),
});

export const questionSchema = z.object({
  text: z.string().min(1, "Question requise"),
  type: z.enum(["MULTIPLE_CHOICE", "SHORT_ANSWER"]),
  order: z.number().int().positive(),
  options: z
    .array(
      z.object({
        text: z.string().min(1),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "Au moins 2 options requises pour QCM"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type ResourceInput = z.infer<typeof resourceSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
