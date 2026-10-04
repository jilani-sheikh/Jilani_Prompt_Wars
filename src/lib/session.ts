import { cookies } from "next/headers";
import { UserSession } from "./types";

const COOKIE_ANON_ID = "blindspot_anon_id";
const COOKIE_USER_SESSION = "blindspot_user_session";

export async function getAnonymousId(): Promise<string> {
  const cookieStore = await cookies();
  let anonId = cookieStore.get(COOKIE_ANON_ID)?.value;
  if (!anonId) {
    anonId = "anon_" + Math.random().toString(36).substring(2, 12);
    cookieStore.set(COOKIE_ANON_ID, anonId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  }
  return anonId;
}

export async function getSessionUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionVal = cookieStore.get(COOKIE_USER_SESSION)?.value;
  if (!sessionVal) return null;
  try {
    const parsed = JSON.parse(Buffer.from(sessionVal, "base64").toString("utf-8"));
    return parsed;
  } catch {
    return null;
  }
}

export async function setSessionUser(user: UserSession): Promise<void> {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(user)).toString("base64");
  cookieStore.set(COOKIE_USER_SESSION, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearSessionUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_USER_SESSION);
}
