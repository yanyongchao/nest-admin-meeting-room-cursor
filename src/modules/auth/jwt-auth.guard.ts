import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 使用父类的canActivate方法
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // 如果有错误或没有用户
    if (err || !user) {
      throw err || new UnauthorizedException('未提供有效的身份验证令牌');
    }
    return user;
  }
}
