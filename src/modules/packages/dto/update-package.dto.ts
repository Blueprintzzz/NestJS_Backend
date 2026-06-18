import { PartialType } from '@nestjs/swagger';
import { CreateTourPackageDto } from './create-package.dto';

export class UpdateTourPackageDto extends PartialType(CreateTourPackageDto) {}
