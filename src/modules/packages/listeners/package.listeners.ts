import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PackageCreatedEvent, PackageUpdatedEvent, PackageDeletedEvent } from '../events/package.events';

@Injectable()
export class PackageCreatedListener {
  @OnEvent('package.created')
  handle(payload: PackageCreatedEvent): void {
    console.log(`[package.created] id=${payload.pkg.id} name=${payload.pkg.name}`);
  }
}

@Injectable()
export class PackageUpdatedListener {
  @OnEvent('package.updated')
  handle(payload: PackageUpdatedEvent): void {
    console.log(`[package.updated] id=${payload.pkg.id}`);
  }
}

@Injectable()
export class PackageDeletedListener {
  @OnEvent('package.deleted')
  handle(payload: PackageDeletedEvent): void {
    console.log(`[package.deleted] id=${payload.id}`);
  }
}
