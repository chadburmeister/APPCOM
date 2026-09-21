"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, setSessionCookie } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type ActionState = { error?: string } | null;

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, password } = parsed.data;

  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase();
  if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) {
    return { error: `Registration is limited to @${allowedDomain} email addresses.` };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(password);

  // Self-registration always creates a regular "member" account. Coach
  // accounts are promoted by an existing coach from the Manage Users page
  // (or by hand in the database for the very first one).
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: "member" })
    .returning();

  await setSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: "member",
  });

  redirect("/");
}
