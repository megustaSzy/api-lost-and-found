export interface AuthData {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "User";
  notelp: string;
}