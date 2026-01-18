import { env } from "@repo/env";
import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import { accessControl } from ".";

export const authClient = createAuthClient({
  baseURL: env.FRONT_END_URL,
  plugins: [
    // @ts-expect-error - Fix type mismatch between admin plugin and core user schema
    adminClient({
      ...accessControl,
    }),
  ],
});
