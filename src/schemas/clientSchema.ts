import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z
    .string()
    .trim()
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "البريد الإلكتروني غير صحيح",
    }),
  phone: z.string().min(10, "رقم الهاتف غير صحيح"),
  address: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
  type: z.enum(["company", "individual"]),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export function normalizeClientEmail(email: string) {
  return email.trim();
}
