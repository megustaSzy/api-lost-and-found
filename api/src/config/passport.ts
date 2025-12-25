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
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ) => {
      try {
        // Pastikan email ada
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Email Google tidak ditemukan"));

        // Cari user di database
        let user = await prisma.tb_user.findUnique({ where: { email } });

        // Kalau belum ada, buat baru
        if (!user) {
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
        }

        // Mapping ke interface User
        const mappedUser: User = {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          role: user.role as "Admin" | "User",
        };

        return done(null, mappedUser); // aman untuk TypeScript
      } catch (err) {
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
