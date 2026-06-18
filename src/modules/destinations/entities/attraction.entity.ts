export class AttractionEntity {
  id: string;
  districtId: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  travelTips: string;
  estimatedVisitingTime: string;
  latitude: number;
  longitude: number;
  openingHours?: string | null;
  entryFee?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
