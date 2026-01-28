import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { getDb } from "./db";
import * as schema from "./db/schema";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

let authInstance: ReturnType<typeof betterAuth> | null = null;

export function getAuth() {
  if (!authInstance) {
    authInstance = betterAuth({
      database: drizzleAdapter(getDb(), {
        provider: "pg",
        schema,
      }),
      emailAndPassword: {
        enabled: true,
        // Disable email verification for MVP (can enable later)
        requireEmailVerification: false,
      },
      emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
          if (!resend) {
            console.log("Resend not configured. Verification URL:", url);
            return;
          }
          await resend.emails.send({
            from: "NextCollab <noreply@nextcollab.io>",
            to: user.email,
            subject: "Verify your email - NextCollab",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">Welcome to NextCollab!</h1>
                <p>Hi ${user.name},</p>
                <p>Please verify your email address by clicking the button below:</p>
                <a href="${url}" style="display: inline-block; background: #e85d4c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                  Verify Email
                </a>
                <p style="color: #6b6b6b; font-size: 14px;">
                  If you didn't create an account, you can safely ignore this email.
                </p>
              </div>
            `,
          });
        },
        sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
          if (!resend) {
            console.log("Resend not configured. Reset URL:", url);
            return;
          }
          await resend.emails.send({
            from: "NextCollab <noreply@nextcollab.io>",
            to: user.email,
            subject: "Reset your password - NextCollab",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">Reset your password</h1>
                <p>Hi ${user.name},</p>
                <p>You requested to reset your password. Click the button below to set a new one:</p>
                <a href="${url}" style="display: inline-block; background: #e85d4c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                  Reset Password
                </a>
                <p style="color: #6b6b6b; font-size: 14px;">
                  If you didn't request this, you can safely ignore this email.
                </p>
              </div>
            `,
          });
        },
      },
      socialProviders: {
        // Add OAuth providers here as needed
        // google: {
        //   clientId: process.env.GOOGLE_CLIENT_ID!,
        //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        // },
      },
    });
  }
  return authInstance;
}

