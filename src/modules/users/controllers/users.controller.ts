import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BookingQueryDto } from '../../booking/dto/booking-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateUserStatusDto, UserQueryDto } from '../dto/user.dto';
import { UsersService } from '../services/users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: 'List all users (admin)' })
    findAll(@Query() query: UserQueryDto) {
        return this.usersService.getAllUsers(query);
    }

    @Get(':id')
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'Get user by ID (admin)' })
    findOne(@Param('id') id: string) {
        return this.usersService.getUserById(id);
    }

    @Patch(':id/status')
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'Update user status (admin)' })
    updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
        return this.usersService.updateUserStatus(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: 'Delete user (admin)' })
    remove(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }

    @Get(':id/bookings')
    @ApiParam({ name: 'id' })
    @ApiOperation({ summary: "Get user's bookings (admin)" })
    getUserBookings(@Param('id') id: string, @Query() query: BookingQueryDto) {
        return this.usersService.getUserBookings(id, query);
    }
}
