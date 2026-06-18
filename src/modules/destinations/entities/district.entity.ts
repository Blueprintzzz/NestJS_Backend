import { AttractionEntity } from './attraction.entity';

export class DistrictEntity {
  id: string;
  name: string;
  description: string;
  weatherInfo: any;
  bestVisitingSeason?: string | null;
  latitude: number;
  longitude: number;
  coverImage?: string | null;
  featured: boolean;
  status: string;
  attractions?: AttractionEntity[];
  createdAt: Date;
  updatedAt: Date;
}
