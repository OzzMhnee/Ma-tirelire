import { z } from 'zod';

// ─── Schémas Zod ─────────────────────────────────────────────

export const emailSchema = z.string().email('Adresse e-mail invalide.');

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
  .max(72, 'Le mot de passe est trop long.');

export const usernameSchema = z
  .string()
  .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.")
  .max(30, "Le nom d'utilisateur est trop long.")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Seuls les lettres, chiffres, _ et - sont autorisés."
  );

export const pseudonymSchema = z
  .string()
  .min(2, 'Le prénom doit contenir au moins 2 caractères.')
  .max(30, 'Le prénom est trop long.');

export const birthYearSchema = z
  .number()
  .int()
  .min(2000, 'Année de naissance invalide.')
  .max(new Date().getFullYear() - 5, "L'enfant doit avoir au moins 5 ans.");

export const rewardSchema = z
  .number()
  .positive('La récompense doit être positive.')
  .max(9999.99, 'La récompense maximale est de 9999,99 €.');

export const missionTitleSchema = z
  .string()
  .min(2, 'Le titre doit contenir au moins 2 caractères.')
  .max(100, 'Le titre est trop long.');

// ─── Schémas de formulaire complets ──────────────────────────

export const signUpSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Veuillez saisir votre email ou nom d\'utilisateur.'),
  password: z.string().min(1, 'Veuillez saisir votre mot de passe.'),
});

export const childCreateSchema = z.object({
  pseudonym: pseudonymSchema,
  birthYear: birthYearSchema.optional(),
  font: z.enum(['arial', 'dyslexic']).default('arial'),
  language: z.enum(['fr', 'en']).default('fr'),
});

export const missionCreateSchema = z.object({
  title: missionTitleSchema,
  description: z.string().max(500).optional(),
  reward: rewardSchema,
  childId: z.string().uuid(),
});

// ─── Types inférés ───────────────────────────────────────────
export type SignUpForm = z.infer<typeof signUpSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type ChildCreateForm = z.infer<typeof childCreateSchema>;
export type MissionCreateForm = z.infer<typeof missionCreateSchema>;
