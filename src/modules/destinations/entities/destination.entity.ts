export class DestinationEntity {
  id: string;
  name: string;
  description: string;
  category: string;
  district?: string | null;
  images: string[];
  coverImage?: string | null;
  latitude: number;
  longitude: number;
  weatherInfo?: any;
  bestVisitingSeason?: string | null;
  travelTips?: string | null;
  estimatedVisitingTime?: string | null;
  openingHours?: string | null;
  entryFee?: number | null;
  featured: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
