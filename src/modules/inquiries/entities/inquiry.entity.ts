import { InquiryCategory, InquiryPriority, InquiryStatus } from '@prisma/client';

export class InquiryResponseEntity {
  id: string;
  inquiryId: string;
  respondedByAdminId: string;
  response: string;
  createdAt: Date;
}

export class InquiryEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  category: InquiryCategory;
  assignedToAdminId?: string | null;
  respondedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  responses?: InquiryResponseEntity[];
}
