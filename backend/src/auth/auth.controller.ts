
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterSchema, LoginSchema, RegisterDto, LoginDto } from './dto/auth.dto';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequireRoles, Role } from '../common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport'; // Assuming standard JwtAuthGuard

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const validation = RegisterSchema.safeParse(dto);
    if (!validation.success) throw new Error("Validation Failed");
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const validation = LoginSchema.safeParse(dto);
    if (!validation.success) throw new Error("Validation Failed");
    return this.authService.login(dto, req.ip);
  }

  @Post('impersonate')
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @RequireRoles(Role.SUPER_ADMIN)
  async impersonate(@Req() req: any, @Body('userId') targetUserId: string) {
    return this.authService.impersonateUser(req.user.sub, targetUserId);
  }
}