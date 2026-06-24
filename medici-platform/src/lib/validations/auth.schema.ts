import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Inserisci la tua email")
    .email("Inserisci un'email valida"),
  password: z.string().min(1, "Inserisci la password"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const baseAccountFields = {
  fullName: z
    .string()
    .min(2, "Inserisci nome e cognome")
    .max(120, "Nome troppo lungo"),
  email: z
    .string()
    .min(1, "Inserisci la tua email")
    .email("Inserisci un'email valida"),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s]{6,20}$/, "Inserisci un numero di telefono valido")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "La password deve avere almeno 8 caratteri")
    .regex(/[A-Z]/, "Deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "Deve contenere almeno un numero"),
  confirmPassword: z.string(),
};

export const patientSignUpSchema = z
  .object(baseAccountFields)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

export type PatientSignUpInput = z.infer<typeof patientSignUpSchema>;

export const doctorSignUpSchema = z
  .object({
    ...baseAccountFields,
    licenseNumber: z
      .string()
      .min(3, "Inserisci il numero di iscrizione all'albo"),
    specializationIds: z
      .array(z.string().uuid())
      .min(1, "Seleziona almeno una specializzazione"),
    yearsExperience: z
      .coerce.number()
      .int()
      .min(0, "Valore non valido")
      .max(70, "Valore non valido"),
    consultationFee: z
      .coerce.number()
      .positive("La tariffa deve essere maggiore di zero")
      .max(2000, "Valore non realistico, verifica l'importo"),
    bio: z
      .string()
      .min(40, "Racconta in almeno 40 caratteri la tua attività professionale")
      .max(2000, "Biografia troppo lunga"),
    consultationType: z.enum(["in_person", "video", "both"]),
    city: z.string().min(2, "Indica la città di studio").optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

export type DoctorSignUpInput = z.infer<typeof doctorSignUpSchema>;

export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, "Inserisci la tua email")
    .email("Inserisci un'email valida"),
});

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La password deve avere almeno 8 caratteri")
      .regex(/[A-Z]/, "Deve contenere almeno una lettera maiuscola")
      .regex(/[0-9]/, "Deve contenere almeno un numero"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;

export const createAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  consultationType: z.enum(["in_person", "video", "both"]),
  patientNotes: z.string().max(500).optional().or(z.literal("")),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
