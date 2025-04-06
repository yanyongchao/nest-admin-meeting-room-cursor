import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './auth.decorator';
import { UserService } from '../user/user.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.userId) {
      throw new ForbiddenException('用户未登录');
    }

    // 如果用户是管理员，直接授予权限
    if (user.isAdmin) {
      return true;
    }

    // 通过用户ID获取用户详情，包括角色和权限
    try {
      const userDetail = await this.userService.getUserDetail(user.userId);

      // 获取用户所有角色的权限
      const hasPermission = await this.userService.checkUserPermission(
        user.userId,
        requiredPermission,
      );

      if (hasPermission) {
        return true;
      }
    } catch (error) {
      throw new ForbiddenException('无法验证用户权限');
    }

    throw new ForbiddenException('权限不足，无法访问该资源');
  }
}
