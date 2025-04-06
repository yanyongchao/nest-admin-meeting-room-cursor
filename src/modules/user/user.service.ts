import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Equal } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User, Role } from './entities';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { DetailUserVo } from './vo/detail-user.vo';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  // 密码加密
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  // 验证密码
  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // 生成 JWT token
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };
    return this.jwtService.sign(payload);
  }

  // 用户登录
  async login(loginUserDto: LoginUserDto): Promise<LoginUserVo> {
    const { username, password } = loginUserDto;

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { username: Equal(username) },
      relations: ['roles'],
    });

    if (!user) {
      throw new BadRequestException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await this.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('用户名或密码错误');
    }

    // 检查用户是否被冻结
    if (user.isFrozen) {
      throw new ForbiddenException('账号已被冻结，请联系管理员');
    }

    // 生成token
    const token = this.generateToken(user);

    // 返回登录信息
    return {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      token,
      roles: user.roles.map((role) => role.name),
    };
  }

  // 管理员登录
  async adminLogin(loginUserDto: LoginUserDto): Promise<LoginUserVo> {
    const { username, password } = loginUserDto;

    // 查找用户
    const user = await this.userRepository.findOne({
      where: {
        username: Equal(username),
        isAdmin: true,
      },
      relations: ['roles'],
    });

    if (!user) {
      throw new BadRequestException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await this.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('用户名或密码错误');
    }

    // 检查用户是否被冻结
    if (user.isFrozen) {
      throw new ForbiddenException('账号已被冻结，请联系管理员');
    }

    // 生成token
    const token = this.generateToken(user);

    // 返回登录信息
    return {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      token,
      roles: user.roles.map((role) => role.name),
    };
  }

  // 用户注册
  async register(registerUserDto: RegisterUserDto): Promise<void> {
    const { username, password, nickName, email, phoneNumber } =
      registerUserDto;

    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username: Equal(username) },
    });
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: Equal(email) },
      });
      if (existingEmail) {
        throw new BadRequestException('邮箱已被使用');
      }
    }

    // 检查手机号是否已存在
    if (phoneNumber) {
      const existingPhone = await this.userRepository.findOne({
        where: { phoneNumber: Equal(phoneNumber) },
      });
      if (existingPhone) {
        throw new BadRequestException('手机号已被使用');
      }
    }

    // 创建新用户
    const user = new User();
    user.username = username;
    user.password = await this.hashPassword(password);
    user.nickName = nickName || '';
    user.email = email || '';
    user.phoneNumber = phoneNumber || '';
    user.isAdmin = false;
    user.isFrozen = false;

    // 获取普通用户角色
    const userRole = await this.roleRepository.findOne({
      where: { name: Equal('普通用户') },
    });
    if (userRole) {
      user.roles = [userRole];
    }

    // 保存用户
    await this.userRepository.save(user);
  }

  // 更新用户密码
  async updatePassword(
    userId: number,
    updatePasswordDto: UpdateUserPasswordDto,
  ): Promise<void> {
    const { oldPassword, newPassword, confirmPassword } = updatePasswordDto;

    // 检查两次密码是否一致
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { id: Equal(userId) },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证旧密码
    const isPasswordValid = await this.validatePassword(
      oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('旧密码不正确');
    }

    // 更新密码
    user.password = await this.hashPassword(newPassword);
    await this.userRepository.save(user);
  }

  // 更新用户信息
  async updateUserInfo(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<DetailUserVo> {
    const { nickName, email, phoneNumber, headPic } = updateUserDto;

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { id: Equal(userId) },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查邮箱是否被其他用户使用
    if (email !== undefined && email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: email === '' ? Equal('') : Equal(email) },
      });
      if (existingEmail && existingEmail.id !== userId) {
        throw new BadRequestException('邮箱已被其他用户使用');
      }
    }

    // 检查手机号是否被其他用户使用
    if (phoneNumber !== undefined && phoneNumber !== user.phoneNumber) {
      const existingPhone = await this.userRepository.findOne({
        where: {
          phoneNumber: phoneNumber === '' ? Equal('') : Equal(phoneNumber),
        },
      });
      if (existingPhone && existingPhone.id !== userId) {
        throw new BadRequestException('手机号已被其他用户使用');
      }
    }

    // 更新用户信息
    if (nickName !== undefined) {
      user.nickName = nickName;
    }

    if (email !== undefined) {
      user.email = email;
    }

    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber;
    }

    if (headPic !== undefined) {
      user.headPic = headPic;
    }

    await this.userRepository.save(user);

    // 返回更新后的用户信息
    return {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      isFrozen: user.isFrozen,
      roles: user.roles.map((role) => role.name),
      createTime: user.createTime,
      updateTime: user.updateTime,
    };
  }

  // 获取用户列表
  async getUserList(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: DetailUserVo[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      relations: ['roles'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createTime: 'DESC',
      },
    });

    const items = users.map((user) => ({
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      isFrozen: user.isFrozen,
      roles: user.roles.map((role) => role.name),
      createTime: user.createTime,
      updateTime: user.updateTime,
    }));

    return { items, total };
  }

  // 冻结/解冻用户
  async freezeUser(userId: number, isFrozen: boolean): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: Equal(userId) },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 不能冻结管理员账号
    if (user.isAdmin && isFrozen) {
      throw new BadRequestException('不能冻结管理员账号');
    }

    user.isFrozen = isFrozen;
    await this.userRepository.save(user);
  }

  // 获取用户详情
  async getUserDetail(userId: number): Promise<DetailUserVo> {
    const user = await this.userRepository.findOne({
      where: { id: Equal(userId) },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      isFrozen: user.isFrozen,
      roles: user.roles.map((role) => role.name),
      createTime: user.createTime,
      updateTime: user.updateTime,
    };
  }
}
