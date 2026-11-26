// Basic Auth in front of the whole site (Vercel Routing Middleware).
// The logins come from the Vercel environment variable BASIC_AUTH_USERS, a JSON
// object of user name to password: {"name1":"password1","name2":"password2"}.
// If it is missing or not readable, nobody gets in.

export const config = { matcher: "/(.*)" };

const deny = () =>
  new Response("Anmeldung erforderlich.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Prozesslandkarte", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

// Compares without stopping at the first different character.
function sameText(a, b) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i % (y.length || 1)];
  return diff === 0;
}

function readLogins(raw) {
  try {
    const parsed = JSON.parse(raw || "");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    return Object.entries(parsed).filter(
      ([user, password]) => user && typeof password === "string" && password
    );
  } catch {
    return [];
  }
}

function readCredentials(header) {
  if (!header || !header.startsWith("Basic ")) return null;
  try {
    const bytes = Uint8Array.from(atob(header.slice(6).trim()), (c) => c.charCodeAt(0));
    const text = new TextDecoder().decode(bytes);
    const cut = text.indexOf(":");
    return cut < 0 ? null : { user: text.slice(0, cut), password: text.slice(cut + 1) };
  } catch {
    return null;
  }
}

export default function middleware(request) {
  const logins = readLogins(process.env.BASIC_AUTH_USERS);
  if (!logins.length) return deny();

  const given = readCredentials(request.headers.get("authorization"));
  if (!given) return deny();

  let ok = 0;
  for (const [user, password] of logins) {
    ok |= sameText(given.user, user) & sameText(given.password, password);
  }
  if (!ok) return deny();

  // Let the request through to the static files.
  return new Response(null, { headers: { "x-middleware-next": "1" } });
}
