import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdateTermsDto } from './dto/update-terms.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/roles.enum';

@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  // PUBLIC
  @Get('info')
  getInfo() {
    return this.service.getInfo();
  }

  @Get('terms')
  getTerms() {
    return this.service.getTerms();
  }

  @Get('privacy')
  getPrivacy() {
    return this.service.getPrivacy();
  }

  // ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('init')
  init(@Body() dto: CreateContactDto) {
    return this.service.init(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('info')
  updateInfo(@Body() dto: UpdateInfoDto) {
    return this.service.updateInfo(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('terms')
  updateTerms(@Body() dto: UpdateTermsDto) {
    return this.service.updateTerms(dto.termsOfService);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('privacy')
  updatePrivacy(@Body() dto: UpdatePrivacyDto) {
    return this.service.updatePrivacy(dto.privacyPolicy);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  adminAll() {
    return this.service.adminAll();
  }
}
