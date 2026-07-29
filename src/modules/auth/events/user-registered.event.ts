import { UserEntity } from '../../users/entities/user.entity';

export class UserRegisteredEvent {
    constructor(public readonly user: UserEntity) { }
}
