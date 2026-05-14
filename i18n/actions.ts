"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, type Locale } from "./routing";

// Server action invoked by the language toggle. Sets a long-lived
// NEXT_LOCALE cookie and invalidates the route so the new locale is
// reflected immediately without a full page reload.
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocaleAction(formData: FormData) {
  const next = formData.get("locale");
  if (typeof next !== "string" || !isLocale(next)) return;
  const path = formData.get("path");
  const target: Locale = next;

  const store = await cookies();
  store.set({
    name: LOCALE_COOKIE,
    value: target,
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  // Revalidate the path the user was on so server-rendered content picks up
  // the new locale on the next render.
  if (typeof path === "string" && path.startsWith("/")) {
    revalidatePath(path);
  } else {
    revalidatePath("/");
  }
}
