import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AttractionsService } from '../services/attractions.service';
import { DistrictsService } from '../services/districts.service';

@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(
    private readonly attractionsService: AttractionsService,
    private readonly districtsService: DistrictsService,
  ) {}

  @Get('data')
  @ApiOperation({ summary: 'Get all districts and attractions for map rendering' })
  async getMapData() {
    const [attractions, districts] = await Promise.all([
      this.attractionsService.getMapData(),
      this.districtsService.getFeaturedDistricts(),
    ]);
    return {
      districts: districts.map((d) => ({ id: d.id, name: d.name, latitude: d.latitude, longitude: d.longitude })),
      attractions,
    };
  }
}
