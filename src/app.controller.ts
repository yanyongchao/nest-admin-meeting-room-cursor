import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from './common/logger';
import { LogCategory } from './common/logger/logger.constants';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  getHello() {
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
}
