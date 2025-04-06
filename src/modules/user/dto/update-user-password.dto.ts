import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsNotEmpty({ message: '旧密码不能为空' })
  @IsString({ message: '旧密码必须是字符串' })
  oldPassword: string;

  @IsNotEmpty({ message: '新密码不能为空' })
  @IsString({ message: '新密码必须是字符串' })
  @Length(6, 50, { message: '新密码长度应在6-50个字符之间' })
  newPassword: string;

  @IsNotEmpty({ message: '确认密码不能为空' })
  @IsString({ message: '确认密码必须是字符串' })
  confirmPassword: string;
}