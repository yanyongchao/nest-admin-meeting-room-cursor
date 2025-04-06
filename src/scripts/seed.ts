import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Role } from '../modules/user/entities/role.entity';
import { User } from '../modules/user/entities/user.entity';
import { Permission } from '../modules/user/entities/permission.entity';
import { DataSource, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  // 确保数据源已连接
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  try {
    console.log('开始初始化数据库...');

    // 创建权限
    console.log('创建基本权限...');
    const permissionRepository = dataSource.getRepository(Permission);

    // 检查权限是否已存在
    const existingPermissions = await permissionRepository.find();
    if (existingPermissions.length > 0) {
      console.log('权限已存在，跳过创建...');
    } else {
      const permissions = [
        { code: 'user:view', name: '查看用户', description: '查看用户信息' },
        { code: 'user:create', name: '创建用户', description: '创建新用户' },
        { code: 'user:update', name: '更新用户', description: '更新用户信息' },
        { code: 'user:delete', name: '删除用户', description: '删除用户' },
        { code: 'role:view', name: '查看角色', description: '查看角色信息' },
        { code: 'role:create', name: '创建角色', description: '创建新角色' },
        { code: 'role:update', name: '更新角色', description: '更新角色信息' },
        { code: 'role:delete', name: '删除角色', description: '删除角色' },
      ];

      for (const permission of permissions) {
        const permissionEntity = permissionRepository.create(permission as DeepPartial<Permission>);
        await permissionRepository.save(permissionEntity);
      }
      console.log('基本权限创建完成');
    }

    // 创建角色
    console.log('创建基本角色...');
    const roleRepository = dataSource.getRepository(Role);

    // 检查角色是否已存在
    const existingRoles = await roleRepository.find();
    if (existingRoles.length > 0) {
      console.log('角色已存在，跳过创建...');
    } else {
      // 获取所有权限
      const allPermissions = await permissionRepository.find();

      // 管理员角色（有所有权限）
      const adminRole = roleRepository.create({
        id: undefined,
        name: '管理员',
        description: '系统管理员，拥有所有权限',
        permissions: allPermissions,
      });
      await roleRepository.save(adminRole);

      // 普通用户角色（只有查看权限）
      const viewPermissions = await permissionRepository.find({
        where: [{ code: 'user:view' }, { code: 'role:view' }],
      });

      const userRole = roleRepository.create({
        id: undefined,
        name: '普通用户',
        description: '普通用户，只有基本查看权限',
        permissions: viewPermissions,
      });
      await roleRepository.save(userRole);

      console.log('基本角色创建完成');
    }

    // 创建管理员用户
    console.log('创建管理员用户...');
    const userRepository = dataSource.getRepository(User);

    // 检查管理员用户是否已存在
    const existingAdmin = await userRepository.findOne({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      console.log('管理员用户已存在，跳过创建...');
    } else {
      const adminRole = await roleRepository.findOne({
        where: { name: '管理员' },
      });

      if (!adminRole) {
        throw new Error('管理员角色不存在，无法创建管理员用户');
      }

      // 生成密码哈希
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);

      const adminUser = userRepository.create({
        username: 'admin',
        password: hashedPassword,
        nickName: '系统管理员',
        email: 'admin@example.com',
        phoneNumber: '',
        headPic: '',
        isAdmin: true,
        isFrozen: false,
        roles: [adminRole],
      });

      await userRepository.save(adminUser);
      console.log('管理员用户创建完成');
    }

    // 创建测试用户
    console.log('创建测试用户...');
    const existingTestUser = await userRepository.findOne({
      where: { username: 'test' },
    });

    if (existingTestUser) {
      console.log('测试用户已存在，跳过创建...');
    } else {
      const userRole = await roleRepository.findOne({
        where: { name: '普通用户' },
      });

      if (!userRole) {
        throw new Error('普通用户角色不存在，无法创建测试用户');
      }

      // 生成密码哈希
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('test123', saltRounds);

      const testUser = userRepository.create({
        username: 'test',
        password: hashedPassword,
        nickName: '测试用户',
        email: 'test@example.com',
        phoneNumber: '',
        headPic: '',
        isAdmin: false,
        isFrozen: false,
        roles: [userRole],
      });

      await userRepository.save(testUser);
      console.log('测试用户创建完成');
    }

    console.log('数据库初始化完成');
  } catch (error) {
    console.error('初始化数据时出错:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
