import { api } from '@/core/api/api';
import { Post } from '../interfaces';

export const getPostsAction = async (): Promise<Post[]> => {
  const { data } = await api.get<Post[]>('/posts');
  return data;
};
