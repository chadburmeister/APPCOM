"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, requireCoach } from "@/lib/auth";

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.union([z.literal("member"), z.literal("coach")]),
});

export type ActionState = { error?: string } | null;

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireCoach();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, password, role } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(password);

  await db.insert(users).values({ name, email, passwordHash, role });

  revalidatePath("/admin/users");
  return null;
}

export async function deactivateUserAction(formData: FormData) {
  const session = await requireCoach();
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === session.sub) return; // can't deactivate yourself

  await db.update(users).set({ active: false }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}

export async function reactivateUserAction(formData: FormData) {
  await requireCoach();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  await db.update(users).set({ active: true }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}
