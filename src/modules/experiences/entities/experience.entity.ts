export enum ExperienceCategory {
  ADVENTURE = 'ADVENTURE',
  NATURE = 'NATURE',
  CULTURAL = 'CULTURAL',
  RELAXATION = 'RELAXATION',
  FAMILY = 'FAMILY',
  ROMANTIC = 'ROMANTIC',
}

export class ExperienceEntity {
  id: string;
  name: string;
  description: string;
  category: ExperienceCategory;
  price: number;
  duration: string;
  image?: string | null;
  images: string[];
  location?: string | null;
  destinationId?: string | null;
  featured: boolean;
  status: string;
  rating?: number | null;
  reviewCount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
