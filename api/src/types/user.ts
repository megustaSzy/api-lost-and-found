export interface User {
  id: number; // wajib number
  name: string;
  email: string;
  role: "Admin" | "User";
}
