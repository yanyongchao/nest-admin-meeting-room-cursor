import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = this.configService.get('redis');

    this.client = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
      password: redisConfig.password,
      database: redisConfig.db,
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis客户端错误: ${err.message}`, err.stack);
    });

    this.client.on('connect', () => {
      this.logger.log(`Redis已连接: ${redisConfig.host}:${redisConfig.port}`);
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error(`Redis连接失败: ${error.message}`, error.stack);
    }
  }

  async onModuleDestroy() {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
      this.logger.log('Redis连接已关闭');
    }
  }

  /**
   * 获取原始Redis客户端
   */
  getClient(): RedisClientType {
    return this.client;
  }

  /**
   * 生成带前缀的键名
   */
  getKey(key: string): string {
    const prefix = this.configService.get('redis.keyPrefix');
    return `${prefix}${key}`;
  }

  /**
   * 设置字符串值
   */
  async set(
    key: string,
    value: string | number | Buffer,
    expireSeconds?: number,
  ): Promise<void> {
    const fullKey = this.getKey(key);

    if (expireSeconds === undefined) {
      expireSeconds = this.configService.get('redis.ttl');
    }

    // 确保expireSeconds有值
    const ttl = expireSeconds ?? 0;

    if (ttl > 0) {
      await this.client.setEx(fullKey, ttl, String(value));
    } else {
      await this.client.set(fullKey, String(value));
    }
  }

  /**
   * 获取字符串值
   */
  async get(key: string): Promise<string | null> {
    const fullKey = this.getKey(key);
    return await this.client.get(fullKey);
  }

  /**
   * 删除键
   */
  async del(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    const result = await this.client.del(fullKey);
    return result > 0;
  }

  /**
   * 批量删除键 (支持通配符)
   */
  async delByPattern(pattern: string): Promise<number> {
    const fullPattern = this.getKey(pattern);
    const keys = await this.client.keys(fullPattern);

    if (keys.length === 0) {
      return 0;
    }

    return await this.client.del(keys);
  }

  /**
   * 设置键过期时间
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const fullKey = this.getKey(key);
    return await this.client.expire(fullKey, seconds);
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    const result = await this.client.exists(fullKey);
    return result > 0;
  }

  /**
   * 设置哈希表字段值
   */
  async hSet(
    key: string,
    field: string,
    value: string | number,
  ): Promise<number> {
    const fullKey = this.getKey(key);
    return await this.client.hSet(fullKey, field, String(value));
  }

  /**
   * 获取哈希表字段值
   */
  async hGet(key: string, field: string): Promise<string | null> {
    const fullKey = this.getKey(key);
    const value = await this.client.hGet(fullKey, field);
    return value === undefined ? null : value;
  }

  /**
   * 获取哈希表所有字段和值
   */
  async hGetAll(key: string): Promise<Record<string, string>> {
    const fullKey = this.getKey(key);
    return await this.client.hGetAll(fullKey);
  }

  /**
   * 删除哈希表字段
   */
  async hDel(key: string, field: string): Promise<number> {
    const fullKey = this.getKey(key);
    return await this.client.hDel(fullKey, field);
  }

  /**
   * 在列表头部添加元素
   */
  async lPush(key: string, value: string): Promise<number> {
    const fullKey = this.getKey(key);
    return await this.client.lPush(fullKey, value);
  }

  /**
   * 在列表尾部添加元素
   */
  async rPush(key: string, value: string): Promise<number> {
    const fullKey = this.getKey(key);
    return await this.client.rPush(fullKey, value);
  }

  /**
   * 获取列表元素
   */
  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    const fullKey = this.getKey(key);
    return await this.client.lRange(fullKey, start, stop);
  }

  /**
   * 设置JSON对象
   */
  async setObject<T>(
    key: string,
    value: T,
    expireSeconds?: number,
  ): Promise<void> {
    await this.set(key, JSON.stringify(value), expireSeconds);
  }

  /**
   * 获取JSON对象
   */
  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        this.logger.error(`解析JSON失败: ${e.message}`, key);
      }
    }
    return null;
  }

  /**
   * 增加计数器
   */
  async incr(key: string): Promise<number> {
    const fullKey = this.getKey(key);
    return await this.client.incr(fullKey);
  }

  /**
   * 增加指定数量
   */
  async incrBy(key: string, increment: number): Promise<number> {
    const fullKey = this.getKey(key);
    return await this.client.incrBy(fullKey, increment);
  }

  /**
   * 减少计数器
   */
  async decr(key: string): Promise<number> {
    const fullKey = this.getKey(key);
    return await this.client.decr(fullKey);
  }

  /**
   * 设置集合元素
   */
  async sAdd(key: string, member: string): Promise<number> {
    const fullKey = this.getKey(key);
    return await this.client.sAdd(fullKey, member);
  }

  /**
   * 获取集合所有元素
   */
  async sMembers(key: string): Promise<string[]> {
    const fullKey = this.getKey(key);
    return await this.client.sMembers(fullKey);
  }

  /**
   * 检查集合中是否存在元素
   */
  async sIsMember(key: string, member: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    return await this.client.sIsMember(fullKey, member);
  }
}
