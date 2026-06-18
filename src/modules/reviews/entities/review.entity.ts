import { ReviewStatus } from '@prisma/client';

export class ReviewPhotoEntity {
  id: string;
  reviewId: string;
  photoUrl: string;
  uploadedAt: Date;
}

export class ReviewEntity {
  id: string;
  bookingId: string;
  userId: string;
  rating: number;
  title: string;
  description: string;
  images: string[];
  status: ReviewStatus;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
  photos?: ReviewPhotoEntity[];
}
