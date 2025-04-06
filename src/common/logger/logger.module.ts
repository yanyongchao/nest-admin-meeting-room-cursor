import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loggerConfig } from './logger.config';
import { LoggerService } from './logger.service';
import { LoggerInterceptor } from './logger.interceptor';
import { LoggerExceptionFilter } from './logger.filter';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => loggerConfig(configService),
    }),
  ],
  providers: [LoggerService, LoggerInterceptor, LoggerExceptionFilter],
  exports: [LoggerService, LoggerInterceptor, LoggerExceptionFilter],
})
export class LoggerModule {}
