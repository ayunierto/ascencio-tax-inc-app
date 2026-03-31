import { User } from "@/core/auth/interfaces/user.interface";

export interface Log {
  id: string;
  description: string;
  user?: User;
  createdAt: string;
}
