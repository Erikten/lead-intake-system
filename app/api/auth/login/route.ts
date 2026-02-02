import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { checkCredentials, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;

  if (!checkCredentials(username, password)) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const token = signToken(username);
  await setAuthCookie(token);

  return NextResponse.json({ success: true });
}