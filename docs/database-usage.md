# 数据库配置与使用指南

## 配置说明

本项目使用 TypeORM 连接 MySQL 数据库，通过环境变量文件配置不同环境的数据库连接信息。

### 环境配置文件

项目支持以下环境配置文件：

- `.dev.env` - 开发环境配置
- `.test.env` - 测试环境配置
- `.prod.env` - 生产环境配置

根据启动命令中的 `NODE_ENV` 环境变量，系统将自动加载相应的配置文件。

### 数据库配置参数

每个环境配置文件中包含以下数据库相关参数：

```
# 数据库配置
DB_HOST=localhost        # 数据库服务器地址
DB_PORT=3306             # 数据库端口
DB_USERNAME=root         # 数据库用户名
DB_PASSWORD=password     # 数据库密码
DB_DATABASE=database     # 数据库名称
```

## 启动不同环境

使用以下命令启动不同环境的应用：

- 开发环境: `npm run start:dev`
- 测试环境: `npm run start:test`  
- 生产环境: `npm run start:prod`

## 数据库连接测试

访问以下接口测试数据库连接：

- `GET /db-test` - 测试数据库连接并返回所有表

## 实体开发指南

所有的数据库实体类都应放在 `src/entities` 目录下，系统会自动扫描并加载这些实体。

### 示例实体

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;
  
  // 其他字段...
}
```

## 注意事项

1. 生产环境不建议开启 `synchronize: true`，以防意外修改数据库结构
2. 生产环境的配置文件不应提交到代码仓库
3. 需确保项目运行环境具有连接数据库的网络权限