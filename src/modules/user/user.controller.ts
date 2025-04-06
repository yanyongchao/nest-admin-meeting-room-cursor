import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/auth.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    await this.userService.register(registerUserDto);
    return { message: '注册成功' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('update_password')
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdateUserPasswordDto,
  ) {
    await this.userService.updatePassword(req.user.userId, updatePasswordDto);
    return { message: '密码修改成功' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  async updateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserInfo(req.user.userId, updateUserDto);
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUserDto: LoginUserDto) {
    return this.userService.adminLogin(loginUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/update_password')
  async adminUpdatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdateUserPasswordDto,
  ) {
    await this.userService.updatePassword(req.user.userId, updatePasswordDto);
    return { message: '密码修改成功' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/update')
  async adminUpdateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserInfo(req.user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('list')
  async getUserList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.userService.getUserList(page, limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('freeze/:id')
  async freezeUser(
    @Param('id') id: number,
    @Query('frozen') frozen: boolean = true,
  ) {
    await this.userService.freezeUser(id, frozen);
    return { message: frozen ? '用户已冻结' : '用户已解冻' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('detail')
  async getUserDetail(@Request() req) {
    return this.userService.getUserDetail(req.user.userId);
  }
}
