import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CreateDriverProfileDto, UpdateDriverProfileDto } from '../../users/dto/user.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import {
    AuthResponseDto,
    ChangePasswordDto,
    RefreshTokenDto,
    UpdateProfileDto,
} from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user (TOURIST or DRIVER)' })
    @ApiResponse({ status: 201, description: 'Returns access + refresh tokens and user' })
    register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token using a valid refresh token' })
    refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto.refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Logout — invalidate refresh token' })
    logout(@CurrentUser() user: any, @Body() body: { refreshToken?: string }) {
        return this.authService.logout(user.id, body?.refreshToken);
    }

    @Get('me')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user profile' })
    getMe(@CurrentUser() user: any) {
        return this.authService.getMe(user.id);
    }

    @Patch('me')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update current user profile' })
    updateMe(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
        return this.authService.updateMe(user.id, dto);
    }

    @Patch('change-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Change password' })
    changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
        return this.authService.changePassword(user.id, dto);
    }

    // ─── Driver Profile ──────────────────────────────────────────────────────

    @Post('driver-profile')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DRIVER)
    @ApiOperation({ summary: 'Create driver profile (DRIVER only)' })
    createDriverProfile(@CurrentUser() user: any, @Body() dto: CreateDriverProfileDto) {
        return this.authService.createDriverProfile(user.id, dto);
    }

    @Get('driver-profile')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DRIVER)
    @ApiOperation({ summary: 'Get current driver profile (DRIVER only)' })
    getDriverProfile(@CurrentUser() user: any) {
        return this.authService.getDriverProfile(user.id);
    }

    @Patch('driver-profile')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DRIVER)
    @ApiOperation({ summary: 'Update driver profile (DRIVER only)' })
    updateDriverProfile(@CurrentUser() user: any, @Body() dto: UpdateDriverProfileDto) {
        return this.authService.updateDriverProfile(user.id, dto);
    }
}
