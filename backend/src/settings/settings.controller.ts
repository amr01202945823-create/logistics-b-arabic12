
import { Controller, Get, Put, Body, UseGuards, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequireRoles, Role } from '../common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  // Public endpoint for frontend to fetch site identity (Logo, Socials, Maintenance Mode)
  @Get('global')
  async getGlobalSettings() {
    return this.settingsService.getGlobalSettings();
  }

  // Admin: Update Global Settings
  @Put('global')
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @RequireRoles(Role.SUPER_ADMIN)
  async updateGlobalSettings(@Body() data: any, @Body('userId') userId: string) {
    return this.settingsService.updateGlobalSetting('site_config', data, userId);
  }

  // Admin: Get AI Prompts
  @Get('prompts')
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @RequireRoles(Role.SUPER_ADMIN, Role.EDITOR)
  async getSystemPrompts() {
    return this.settingsService.getSystemPrompts();
  }

  // Admin: Update AI Prompts (The "Route Planner" instruction)
  @Put('prompts/:key')
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @RequireRoles(Role.SUPER_ADMIN)
  async updateSystemPrompt(
    @Param('key') key: string, 
    @Body() data: { instruction: string, model?: string }
  ) {
    return this.settingsService.updateSystemPrompt(key, data.instruction, data.model);
  }
}