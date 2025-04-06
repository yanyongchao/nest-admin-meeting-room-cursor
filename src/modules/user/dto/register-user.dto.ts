import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @Length(2, 50, { message: '用户名长度应在2-50个字符之间' })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 50, { message: '密码长度应在6-50个字符之间' })
  password: string;

  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @Length(2, 50, { message: '昵称长度应在2-50个字符之间' })
  nickName?: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Length(11, 11, { message: '手机号必须是11位' })
  phoneNumber?: string;
}
