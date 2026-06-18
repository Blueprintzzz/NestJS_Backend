export class CategoryEntity {
  id: string;
  name: string;
  description: string;
  icon?: string | null;
  color?: string | null;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
