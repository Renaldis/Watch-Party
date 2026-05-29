import { auth } from "@/lib/auth";

export async function getServerSession(headers: Headers) {
  return auth.api.getSession({
    headers,
  });
}
