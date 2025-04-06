import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Post('set')
  async set(@Body() body: { key: string; value: string; ttl?: number }) {
    const { key, value, ttl } = body;
    await this.redisService.set(key, value, ttl);
    return {
      success: true,
      message: '设置成功',
    };
  }

  @Get('get/:key')
  async get(@Param('key') key: string) {
    const value = await this.redisService.get(key);
    return {
      success: true,
      data: value,
    };
  }

  @Delete('del/:key')
  async del(@Param('key') key: string) {
    const result = await this.redisService.del(key);
    return {
      success: result,
      message: result ? '删除成功' : '键不存在',
    };
  }

  @Post('object/set')
  async setObject(@Body() body: { key: string; value: any; ttl?: number }) {
    const { key, value, ttl } = body;
    await this.redisService.setObject(key, value, ttl);
    return {
      success: true,
      message: '设置对象成功',
    };
  }

  @Get('object/get/:key')
  async getObject(@Param('key') key: string) {
    const value = await this.redisService.getObject(key);
    return {
      success: true,
      data: value,
    };
  }

  @Get('health')
  async healthCheck() {
    try {
      const client = this.redisService.getClient();
      const ping = await client.ping();
      return {
        status: 'ok',
        ping,
        connected: client.isOpen,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}