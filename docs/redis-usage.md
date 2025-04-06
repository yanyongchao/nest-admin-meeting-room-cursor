# Redis模块使用指南

## 概述

Redis模块提供了对Redis的常用操作封装，支持字符串、哈希表、列表、集合等数据类型，还提供了JSON对象的序列化与反序列化功能。

## 配置

Redis模块通过环境配置文件(.env)读取配置参数：

```
# Redis配置
REDIS_HOST=localhost        # Redis服务器地址
REDIS_PORT=6379             # Redis端口
REDIS_PASSWORD=             # Redis密码，如果没有则留空
REDIS_DB=0                  # 使用的数据库编号
REDIS_TTL=86400             # 默认缓存过期时间(秒)
REDIS_KEY_PREFIX=admin:     # 键名前缀
```

## 使用方法

### 在服务中注入

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class YourService {
  constructor(private readonly redisService: RedisService) {}
  
  async someMethod() {
    // 使用Redis服务
    await this.redisService.set('key', 'value', 3600); // 设置键值，过期时间1小时
    const value = await this.redisService.get('key');  // 获取键值
  }
}
```

### 存储对象

```typescript
// 存储对象
await redisService.setObject('user:1', { id: 1, name: '张三', role: 'admin' });

// 获取对象
const user = await redisService.getObject<User>('user:1');
```

### 使用哈希表

```typescript
// 设置哈希表字段
await redisService.hSet('user:profile:1', 'name', '张三');
await redisService.hSet('user:profile:1', 'age', '30');

// 获取哈希表字段
const name = await redisService.hGet('user:profile:1', 'name');

// 获取整个哈希表
const profile = await redisService.hGetAll('user:profile:1');
```

### 使用列表

```typescript
// 添加到列表
await redisService.lPush('messages', '消息1');
await redisService.lPush('messages', '消息2');

// 获取列表内容
const messages = await redisService.lRange('messages', 0, -1); // 获取所有元素
```

### 使用计数器

```typescript
// 增加计数
await redisService.incr('visitor:count');

// 获取计数值
const count = await redisService.get('visitor:count');
```

## API测试接口

Redis模块提供了以下HTTP接口用于测试：

- `POST /redis/set` - 设置字符串值
- `GET /redis/get/:key` - 获取字符串值
- `DELETE /redis/del/:key` - 删除键
- `POST /redis/object/set` - 设置JSON对象
- `GET /redis/object/get/:key` - 获取JSON对象
- `GET /redis/health` - 检查Redis连接状态

## 示例

### 设置值
```bash
curl -X POST http://localhost:3000/redis/set -H "Content-Type: application/json" -d '{"key":"test","value":"hello world","ttl":3600}'
```

### 获取值
```bash
curl http://localhost:3000/redis/get/test
```

### 健康检查
```bash
curl http://localhost:3000/redis/health
```