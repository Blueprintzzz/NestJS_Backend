import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class TokenCleanupService {
    private readonly logger = new Logger(TokenCleanupService.name);

    constructor(private readonly usersService: UsersService) { }

    /** Runs at 2 AM every day. Deletes all expired refresh tokens across all users. */
    @Cron('0 2 * * *')
    async cleanExpiredTokens(): Promise<void> {
        const deleted = await this.usersService.purgeAllExpiredRefreshTokens();
        this.logger.log(`[token-cleanup] Deleted ${deleted} expired refresh token(s)`);
    }
}
