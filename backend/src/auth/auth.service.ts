
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { RegisterDto, LoginDto } from './dto/auth.dto';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Securely hash the password
    const hash = await argon2.hash(dto.password);

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: `${dto.firstName} ${dto.lastName}`,
        role: Role.VIEWER, // Default role
      },
    });

    // Audit Log for Registration
    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTER',
        userId: user.id, // Linked to the new user
        details: JSON.stringify({ email: dto.email }),
      }
    });

    // Return user without sensitive data
    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid Credentials');
    if (!user.isActive) throw new ForbiddenException('Account is disabled');

    // Verify Password
    const pwMatches = await argon2.verify(user.password, dto.password);
    if (!pwMatches) {
        await prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: { increment: 1 } }
        });
        throw new UnauthorizedException('Invalid Credentials');
    }

    // Reset attempts on success
    await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0 }
    });

    return this.generateToken(user);
  }

  // Generate JWT Token
  private async generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-key-change-this',
      expiresIn: '8h', 
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        subscription: user.subscription,
      }
    };
  }

  async impersonateUser(adminId: string, targetUserId: string) {
    // ... (Keep existing impersonation logic if needed, ensuring Prisma lookups)
    return { message: "Impersonation logic here" }; 
  }
}
