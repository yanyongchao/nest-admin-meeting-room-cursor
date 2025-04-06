import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    const secretKey = configService.get<string>('JWT_SECRET');
    if (!secretKey) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  async validate(payload: any) {
    // 查询用户及其角色
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['roles'],
    });

    if (!user) {
      return null;
    }

    return {
      userId: payload.sub,
      username: payload.username,
      isAdmin: payload.isAdmin,
      roles: user.roles.map((role) => role.name),
    };
  }
}
