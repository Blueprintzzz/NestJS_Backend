import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from '../events/user-registered.event';

@Injectable()
export class UserRegisteredListener {
    @OnEvent('auth.user.registered')
    handle(payload: UserRegisteredEvent): void {
        const id = payload.user.id.replace(/[\r\n]/g, '');
        const email = payload.user.email.replace(/[\r\n]/g, '');
        console.log(`[auth.user.registered] id=${id} email=${email}`);
        // TODO: send welcome email
    }
}
