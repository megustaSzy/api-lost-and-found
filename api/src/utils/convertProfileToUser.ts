import { Profile } from "passport-google-oauth20";
import { User } from "../types/user";

export function convertProfileToUser(profile: Profile, role: "User" | "Admin" = "User"): User {
  return {
    id: Number(profile.id),               // convert string → number
    name: profile.displayName || "",
    email: profile.emails?.[0]?.value || "",
    role,                                 // default User
  };
}
