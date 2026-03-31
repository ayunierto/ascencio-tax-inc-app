import { User } from '@/core/auth/interfaces';

export interface Post {
  id: string;
  url: string;
  title: string;
  createdAt: string;
  updatedAt: string;

  user: User;
}
