import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from './common/logger';
import { LogCategory } from './common/logger/logger.constants';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { PermissionGuard } from './modules/auth/permission.guard';
import { Permission } from './modules/auth/auth.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    this.logger.info('访问首页', LogCategory.SYSTEM, { method: 'getHello' });
    throw new Error('测试异常');
    return this.appService.getHello();
  }

  @Get('error')
  testError(): string {
    this.logger.error(
      '测试错误日志',
      LogCategory.SYSTEM,
      new Error('这是一个测试错误'),
    );
    throw new Error('测试异常过滤器');
  }

  @Get('env')
  getEnv(): any {
    return {
      database: this.configService.get('database'),
      nodeEnv: this.configService.get('NODE_ENV'),
    };
  }

  @Get('db-test')
  async testDatabaseConnection(): Promise<any> {
    try {
      // 检查数据库连接
      const isConnected = this.dataSource.isInitialized;

      // 获取所有表
      const tables = await this.dataSource.query('SHOW TABLES');

      return {
        isConnected,
        tables,
        message: '数据库连接成功',
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error.message,
        message: '数据库连接失败',
      };
    }
  }

  @Get('aaa')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission('user:create')
  getAaa(): string {
    this.logger.info('访问 /aaa', LogCategory.SYSTEM, { method: 'getAaa' });
    return '访问成功';
  }
}
