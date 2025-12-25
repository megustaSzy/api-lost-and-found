import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import prisma from "../lib/prisma";
import { User } from "../types/user";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("\n--- [PASSPORT GOOGLE CALLBACK TRIGGERED] ---");
        console.log("Google AccessToken exists:", !!accessToken);
        console.log("Google RefreshToken exists:", !!refreshToken);
        console.log("Google Profile ID:", profile.id);
        console.log("Google Display Name:", profile.displayName);
        console.log("Google Emails:", profile.emails);

        const email = profile.emails?.[0]?.value;
        console.log("Extracted Email:", email);

        if (!email) {
          console.log("❌ Email not found in Google profile!");
          return done(new Error("Email Google tidak ditemukan"));
        }

        let user = await prisma.tb_user.findUnique({ where: { email } });

        if (!user) {
          console.log("⚠ User not found, creating new user...");
          user = await prisma.tb_user.create({
            data: {
              name: profile.displayName,
              email,
              provider: "google",
              providerId: profile.id,
              password: null,
              notelp: null,
              role: "User",
            },
          });
          console.log("New user created:", user);
        }

        const mappedUser: User = {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          role: user.role as "Admin" | "User",
        };

        console.log("Mapped user returned to req.user:", mappedUser);
        console.log("--- [PASSPORT DONE] ---\n");

        return done(null, mappedUser);
      } catch (err) {
        console.log("🔥 Error in Passport callback:", err);
        return done(err as any, undefined);
      }
    }
  )
);

// Serialisasi user ke session
passport.serializeUser((user, done) => {
  done(null, user.id); // id pasti number
});

// Deserialisasi user dari session
passport.deserializeUser(async (id: number, done) => {
  try {
    const userFromDb = await prisma.tb_user.findUnique({ where: { id } });
    if (!userFromDb) return done(null, undefined);

    const mappedUser: User = {
      id: Number(userFromDb.id),
      name: userFromDb.name,
      email: userFromDb.email,
      role: userFromDb.role as "Admin" | "User",
    };

    done(null, mappedUser);
  } catch (err) {
    done(err as any, undefined);
  }
});

export default passport;
