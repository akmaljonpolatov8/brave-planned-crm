import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { z, ZodTypeAny } from "zod";

export async function getSession() {
  return auth();
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return { error: jsonError("Unauthorized", 401) as const };
  }
  return { session };
}

export async function parseJson<T extends ZodTypeAny>(req: Request, schema: T) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      error: jsonError(
        parsed.error.issues[0]?.message ?? "Validation failed",
        400,
      ) as const,
    };
  }
  return { data: parsed.data as z.infer<T> };
}

export function startOfUtcDay(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

export function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}
