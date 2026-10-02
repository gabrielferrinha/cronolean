import { createHash, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const OPERATOR_USERNAME = "Operador 1";
const OPERATOR_EMAIL = "operador-1@cronolean.local";

function safeMatches(value: string, expected: string) {
  const actualHash = createHash("sha256").update(value, "utf8").digest();
  const expectedHash = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(actualHash, expectedHash);
}

export const signInOperator = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ username: z.string().trim().min(1), password: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    const expectedPassword = process.env["OPERATOR_ONE_PASSWORD"];
    if (!expectedPassword || !safeMatches(data.username.toLocaleLowerCase("pt-BR"), OPERATOR_USERNAME.toLocaleLowerCase("pt-BR")) || !safeMatches(data.password, expectedPassword)) {
      return { ok: false as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) throw listError;

    let user = users.users.find((candidate) => candidate.email === OPERATOR_EMAIL);
    if (!user) {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: OPERATOR_EMAIL,
        password: expectedPassword,
        email_confirm: true,
        user_metadata: { username: OPERATOR_USERNAME, display_name: OPERATOR_USERNAME },
      });
      if (createError) throw createError;
      user = created.user;
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: OPERATOR_EMAIL,
    });
    if (linkError) throw linkError;

    return {
      ok: true as const,
      accessToken: linkData.properties.hashed_token,
      email: OPERATOR_EMAIL,
    };
  });