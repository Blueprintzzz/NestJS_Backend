import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AttractionCreatedEvent, AttractionUpdatedEvent, DistrictCreatedEvent, DistrictUpdatedEvent } from '../events/destination.events';

@Injectable()
export class DestinationListener {
  @OnEvent('destination.district.created')
  onDistrictCreated(payload: DistrictCreatedEvent): void {
    console.log(`[destination.district.created] id=${payload.district.id} name=${payload.district.name}`);
  }

  @OnEvent('destination.district.updated')
  onDistrictUpdated(payload: DistrictUpdatedEvent): void {
    console.log(`[destination.district.updated] id=${payload.district.id}`);
  }

  @OnEvent('destination.attraction.created')
  onAttractionCreated(payload: AttractionCreatedEvent): void {
    console.log(`[destination.attraction.created] id=${payload.attraction.id} name=${payload.attraction.name}`);
  }

  @OnEvent('destination.attraction.updated')
  onAttractionUpdated(payload: AttractionUpdatedEvent): void {
    console.log(`[destination.attraction.updated] id=${payload.attraction.id}`);
  }
}
