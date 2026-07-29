import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserLoggedInEvent } from '../events/user-logged-in.event';

@Injectable()
export class UserLoggedInListener {
    @OnEvent('auth.user.logged_in')
    handle(payload: UserLoggedInEvent): void {
        const id = payload.user.id.replace(/[\r\n]/g, '');
        console.log(`[auth.user.logged_in] id=${id}`);
        // TODO: audit log
    }
}
