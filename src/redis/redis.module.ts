import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from '../config/redis.config';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';

@Global() // 全局模块，方便在各处注入使用
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  controllers: [RedisController],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
