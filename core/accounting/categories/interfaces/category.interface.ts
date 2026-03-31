import { Subcategory } from '../../subcategories/interfaces/subcategory.interface';

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  subcategories: Subcategory[];
}
