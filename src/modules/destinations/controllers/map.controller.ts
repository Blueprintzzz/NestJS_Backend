import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DestinationsService } from '../services/destinations.service';

@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get('data')
  @ApiOperation({ summary: 'Get all destinations for map rendering' })
  async getMapData() {
    const destinations = await this.destinationsService.getMapData();
    return { destinations };
  }
}
