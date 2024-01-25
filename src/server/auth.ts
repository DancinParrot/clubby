import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { env } from "~/env.mjs";
import { db } from "~/server/db";
import * as jose from 'jose';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: PrismaAdapter(db),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    {
      id: "singpass",
      name: "Singpass",
      type: "oauth",
      wellKnown: "http://localhost:5156/singpass/v2/.well-known/openid-configuration",
      authorization: {
        params: {
          scope: "openid",
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.sub.substring(2, profile.sub.indexOf(",")),
        }
      },
      token: {
        async request(context) {
          const alg = 'ES512'

          const jwk =
          {
            "kty": "EC",
            "d": "AFOzlND2sq43ykty-VZXw-IEIOyHkBsNXUU77o5yEYcktpoMe9Dl3jsaXwzRK6wtDJH_uoz4IG1Uj4J_WyH5O3GS",
            "use": "sig",
            "crv": "P-521",
            "kid": "sig-2022-06-04T09:22:28Z",
            "x": "AAj_CAKL9NmP6agPCMto6_LiYQqko3o3ZWTtBg75bA__Z8yKEv_CwHzaibkVLnJ9XKWxCQeyEk9ROLhJoJuZxnsI",
            "y": "AZeoe0v-EwqD3oo1V5lxUAmC80qHt-ybqOsl1mYKPgE_ctGcD4hj8tVhmD0Of6ARuKVTxNWej-X82hEW_7Aa-XpR",
            "alg": "ES512"
          };
          const privateKey = await jose.importJWK(jwk, alg);

          const client_assertion = await new jose.SignJWT({})
            .setProtectedHeader({ alg, typ: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer' })
            .setIssuedAt()
            .setSubject('undefined') // sub == iss == client_id
            .setAudience('http://localhost:5156/singpass/v2')
            .setIssuer('test')
            .setExpirationTime('2m')
            .sign(privateKey);

          const response = await fetch("http://localhost:5156/singpass/v2/token", {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            method: "POST",
            body: new URLSearchParams({
              client_id: context.provider.clientId!,
              client_assertion: client_assertion,
              client_assertion_type:
                "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
              code: context.params.code!,
              code_verifier: context.checks.code_verifier!,
              grant_type: "authorization_code",
              redirect_uri: context.provider.callbackUrl,
            }),
          });

          const encryptionJwk =
          {
            "kty": "EC",
            "d": "AP7xECOnlKW-FuLpe1h3ULZoqFzScFrbyAEQTFFG49j5HRHl0k13-6_6nWnwJ9Y8sTrGOWH4GszmDBBZGGvESJQr",
            "use": "enc",
            "crv": "P-521",
            "kid": "enc-2022-06-04T13:46:15Z",
            "x": "AB-16HyJwnlSZbQtqhFskADqFrm6rgX9XeaV8FgynX61750GCRbYjoueDosSNt-qzK5QNHskdQw0QZ700YF2JIlb",
            "y": "AZwYlSBSdV-CxGRMz6ovTvWxKJ6e44gaZHf-YfbJV7w9VdAJb3OuzbHNGRuzNDjEa8eH-paLDaAB84ezrEm1SRHq",
            "alg": "ECDH-ES+A256KW"
          }

          const encryptionKey = await jose.importJWK(encryptionJwk, 'ECDH-ES+A256KW');

          const jwt = await response.json();

          console.log(jwt);

          const { plaintext, protectedHeader } = await jose.compactDecrypt(jwt.id_token, encryptionKey);
          console.log(new TextDecoder().decode(plaintext));

          return {
            tokens: {
              access_token: jwt.access_token,
              token_type: 'Bearer',
              id_token: new TextDecoder().decode(plaintext)
            }
          }
        },
      },
      idToken: true,
      checks: ["pkce", "state", "nonce"],
      client: {
        client_id: 'test',
        token_endpoint_auth_method: 'private_key_jwt',
      },
      jwks:
      {
        "keys": [
          {
            "kty": "EC",
            "d": "AFOzlND2sq43ykty-VZXw-IEIOyHkBsNXUU77o5yEYcktpoMe9Dl3jsaXwzRK6wtDJH_uoz4IG1Uj4J_WyH5O3GS",
            "use": "sig",
            "crv": "P-521",
            "kid": "sig-2022-06-04T09:22:28Z",
            "x": "AAj_CAKL9NmP6agPCMto6_LiYQqko3o3ZWTtBg75bA__Z8yKEv_CwHzaibkVLnJ9XKWxCQeyEk9ROLhJoJuZxnsI",
            "y": "AZeoe0v-EwqD3oo1V5lxUAmC80qHt-ybqOsl1mYKPgE_ctGcD4hj8tVhmD0Of6ARuKVTxNWej-X82hEW_7Aa-XpR",
            "alg": "ES512"
          },
          {
            "kty": "EC",
            "d": "AP7xECOnlKW-FuLpe1h3ULZoqFzScFrbyAEQTFFG49j5HRHl0k13-6_6nWnwJ9Y8sTrGOWH4GszmDBBZGGvESJQr",
            "use": "enc",
            "crv": "P-521",
            "kid": "enc-2022-06-04T13:46:15Z",
            "x": "AB-16HyJwnlSZbQtqhFskADqFrm6rgX9XeaV8FgynX61750GCRbYjoueDosSNt-qzK5QNHskdQw0QZ700YF2JIlb",
            "y": "AZwYlSBSdV-CxGRMz6ovTvWxKJ6e44gaZHf-YfbJV7w9VdAJb3OuzbHNGRuzNDjEa8eH-paLDaAB84ezrEm1SRHq",
            "alg": "ECDH-ES+A256KW"
          }
        ]
      }
    },
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
