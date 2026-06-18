import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InquiryCreatedEvent, InquiryRespondedEvent } from '../events/inquiry.events';

@Injectable()
export class InquiryCreatedListener {
  @OnEvent('inquiry.created')
  handle(payload: InquiryCreatedEvent): void {
    console.log(`[inquiry.created] id=${payload.inquiry.id} email=${payload.inquiry.email}`);
    // TODO: notify admin via email
  }
}

@Injectable()
export class InquiryRespondedListener {
  @OnEvent('inquiry.responded')
  handle(payload: InquiryRespondedEvent): void {
    console.log(`[inquiry.responded] id=${payload.inquiry.id}`);
    // TODO: send response email to customer
  }
}
