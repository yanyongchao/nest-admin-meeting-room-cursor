import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const PERMISSION_KEY = 'permission';
export const Permission = (permission: string) =>
  SetMetadata(PERMISSION_KEY, permission);
