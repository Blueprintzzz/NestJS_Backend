import { UserEntity } from '../../users/entities/user.entity';

export class UserLoggedInEvent {
    constructor(public readonly user: UserEntity) { }
}
