import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

const AUTH_PAGES = ["/login", "/cadastro"];
const MFA_SETUP = "/mfa/setup";
const MFA_VERIFY = "/mfa/verify";
const HOME = "/dashboard";

function isProtected(path: string) {
  return path === "/" || path.startsWith(HOME) || path.startsWith("/mfa");
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const path = request.nextUrl.pathname;

  const redirectTo = (target: string) => {
    const redirect = NextResponse.redirect(new URL(target, request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    response.headers.forEach((value, key) => {
      if (key !== "set-cookie") redirect.headers.set(key, value);
    });
    return redirect;
  };

  if (!data?.claims) {
    return isProtected(path) ? redirectTo("/login") : response;
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  let requiredStep: string | null = null;
  if (aal?.nextLevel !== "aal2") {
    requiredStep = MFA_SETUP;
  } else if (aal.currentLevel !== "aal2") {
    requiredStep = MFA_VERIFY;
  }

  const isAuthPage = AUTH_PAGES.includes(path);

  if (requiredStep) {
    if (path !== requiredStep && (isProtected(path) || isAuthPage)) {
      return redirectTo(requiredStep);
    }
    return response;
  }

  if (isAuthPage || path === "/" || path.startsWith("/mfa")) {
    return redirectTo(HOME);
  }

  return response;
}
