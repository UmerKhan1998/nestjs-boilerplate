import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('social-login')
  socialLogin(@Body() dto: SocialLoginDto) {
    return this.authService.socialLogin(dto.firebaseToken);
  }

  // // @UseGuards(JwtAuthGuard)
  // @Post('logout')
  // async logout(@Req() req: Request, @Res() res: Response) {
  //   console.log('authHeader', req.headers);
  //   const authHeader = req.headers?.authorization;
  //   const token = authHeader?.split(' ')[1];

  //   if (!token) throw new UnauthorizedException('Token not found');
  //   // if (!token) {
  //   //   return res.status(401).json({ message: "Token not found" });
  //   // }

  //   await this.authService.logout(token);

  //   // res.clearCookie('token');
  //   return new UnauthorizedException('Logout successful');
  // }
}
