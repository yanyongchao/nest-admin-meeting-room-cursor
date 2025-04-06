import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerInterceptor, ensureLogDirectoryExists } from './common/logger';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ResponseInterceptor } from './common/interceptors';
import { HttpExceptionFilter } from './common/filters';

async function bootstrap() {
  // 确保日志目录存在
  ensureLogDirectoryExists();

  try {
    const app = await NestFactory.create(AppModule);

    // 全局验证管道
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // 获取Winston日志实例
    const logger = app.get(WINSTON_MODULE_PROVIDER);

    // 设置全局拦截器
    app.useGlobalInterceptors(
      new LoggerInterceptor(logger),
      new ResponseInterceptor(),
    );

    // 设置全局异常过滤器
    app.useGlobalFilters(new HttpExceptionFilter());

    // 启动应用
    const port = process.env.PORT ?? 3000;
    await app.listen(port);

    const appUrl = await app.getUrl();
    // 使用正确的格式记录应用启动信息
    logger.log({
      level: 'info',
      message: `应用已启动，运行在: ${appUrl}，端口: ${port}`,
      context: 'NestApplication',
      timestamp: new Date().toISOString(),
    });

    // 控制台也打印一下，确保可见
    console.log(`应用已启动，运行在: ${appUrl}`);
  } catch (error) {
    console.error('应用启动失败:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

bootstrap();
