import { User as MyUser } from "./user";

declare global {
  namespace Express {
    interface User extends MyUser {}
  }
}
