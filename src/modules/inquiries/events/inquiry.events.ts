import { InquiryEntity } from '../entities/inquiry.entity';

export class InquiryCreatedEvent {
  constructor(public readonly inquiry: InquiryEntity) {}
}

export class InquiryRespondedEvent {
  constructor(public readonly inquiry: InquiryEntity, public readonly response: string) {}
}
