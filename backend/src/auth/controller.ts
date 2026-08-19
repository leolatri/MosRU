import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './service';
import { UserDTO } from '../dto/dtoModels';
import { Public } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: UserDTO) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('register')
  registration(@Body() dto: UserDTO) {
    return this.authService.registration(dto);
  }
}
