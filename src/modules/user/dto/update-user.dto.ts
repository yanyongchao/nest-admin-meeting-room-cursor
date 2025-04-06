import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @Length(2, 50, { message: '昵称长度应在2-50个字符之间' })
  nickName?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Length(11, 11, { message: '手机号必须是11位' })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: '头像地址必须是字符串' })
  headPic?: string;
}
