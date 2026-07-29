import { SafeUserEntity } from '../../users/entities/user.entity';

export class TokenPairDto {
    accessToken: string;
    refreshToken: string;
}

export class AuthResponseDto extends TokenPairDto {
    user: SafeUserEntity;
}

export class RefreshTokenDto {
    refreshToken: string;
}

export class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
}

export class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
